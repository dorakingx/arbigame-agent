import { NextResponse } from "next/server";
import type { GameSpec, GameTheme } from "@shared/types/GameSpec";
import { parsePromptToGameSpec } from "@/lib/gameSpecParser";

type GenerateGameRequest = {
  prompt?: unknown;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type GeminiGameSpec = Partial<Pick<GameSpec, "title" | "theme" | "entryFeeEth" | "prizeRule" | "rules">>;

const themes = new Set<GameTheme>(["fantasy", "cyberpunk", "medieval", "default"]);
const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as GenerateGameRequest;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const fallbackSpec = parsePromptToGameSpec(prompt);

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({
      spec: fallbackSpec,
      source: "local-fallback",
      message: "GEMINI_API_KEY is not configured, so the local safe generator was used."
    });
  }

  try {
    const geminiSpec = await generateWithGemini(prompt);

    return NextResponse.json({
      spec: normalizeGameSpec(geminiSpec, fallbackSpec),
      source: "gemini"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini generation failed.";

    return NextResponse.json({
      spec: fallbackSpec,
      source: "local-fallback",
      message
    });
  }
}

async function generateWithGemini(prompt: string): Promise<GeminiGameSpec> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY ?? ""
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text:
              "You are an AI game designer for an Arbitrum hackathon demo. Return only JSON for a safe, single-player dice game. Do not return markdown."
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                "Generate a GameSpec JSON object for this prompt:",
                prompt,
                "",
                "Required JSON fields:",
                'title: short game title, max 40 characters',
                'theme: one of "fantasy", "cyberpunk", "medieval", "default"',
                'entryFeeEth: use "0.001" unless the prompt explicitly asks for another ETH value',
                "prizeRule: one concise sentence",
                "rules: exactly 5 short rules for a solo dice game where rolling 4, 5, or 6 wins",
                "",
                "The game must stay on Arbitrum Sepolia, be one-player only, and use the existing DiceBattle template."
              ].join("\n")
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.75,
        response_mime_type: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as GeminiGenerateContentResponse;
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return parseGeminiJson(text);
}

function parseGeminiJson(text: string): GeminiGameSpec {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Gemini returned an invalid GameSpec.");
  }

  return parsed as GeminiGameSpec;
}

function normalizeGameSpec(geminiSpec: GeminiGameSpec, fallbackSpec: GameSpec): GameSpec {
  const theme = typeof geminiSpec.theme === "string" && themes.has(geminiSpec.theme) ? geminiSpec.theme : fallbackSpec.theme;
  const title = cleanText(geminiSpec.title, fallbackSpec.title, 40);
  const entryFeeEth = cleanEntryFee(geminiSpec.entryFeeEth) ?? fallbackSpec.entryFeeEth;
  const prizeRule = cleanText(geminiSpec.prizeRule, fallbackSpec.prizeRule, 150);
  const rules = Array.isArray(geminiSpec.rules)
    ? geminiSpec.rules.map((rule) => cleanText(rule, "", 140)).filter(Boolean).slice(0, 5)
    : [];

  return {
    ...fallbackSpec,
    title,
    theme,
    entryFeeEth,
    prizeRule,
    rules: rules.length === 5 ? rules : fallbackSpec.rules
  };
}

function cleanText(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== "string") {
    return fallback;
  }

  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}

function cleanEntryFee(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!/^\d+(?:\.\d{1,6})?$/.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}
