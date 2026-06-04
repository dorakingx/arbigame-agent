"use client";

import { useMemo, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { AgentTrace } from "@/components/AgentTrace";
import { ContractCodeViewer } from "@/components/ContractCodeViewer";
import { GamePreview } from "@/components/GamePreview";
import { GameSpecPreview } from "@/components/GameSpecPreview";
import { HackathonPitchSection } from "@/components/HackathonPitchSection";
import { PromptForm } from "@/components/PromptForm";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { generateDiceBattleContract } from "@/lib/diceBattleTemplate";
import { generateGame } from "@/lib/mockAgent";
import type { GameSpec } from "@shared/types/GameSpec";

const defaultPrompt =
  "Create a fantasy solo dice battle game on Arbitrum. One player deposits 0.001 ETH and wins by rolling 4 or higher.";

const examples = [
  "Create a fantasy solo dice battle game where one player deposits 0.001 ETH and wins on 4 or higher.",
  "Create a cyberpunk one-player dice challenge on Arbitrum with a neon UI.",
  "Create a solo medieval dice trial for Arbitrum Sepolia."
];

export default function Home() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [spec, setSpec] = useState<GameSpec>(() => generateGame(defaultPrompt));
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentSource, setAgentSource] = useState<"gemini" | "local-fallback">("local-fallback");
  const [agentMessage, setAgentMessage] = useState("Local safe generator is ready until GEMINI_API_KEY is configured.");

  const contractCode = useMemo(() => generateDiceBattleContract(spec), [spec]);

  async function handleGenerate() {
    setIsGenerating(true);
    setAgentMessage("Asking AI game designer for a safe Dice Battle spec...");

    try {
      const response = await fetch("/api/generate-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
        source?: "gemini" | "local-fallback";
        spec?: GameSpec;
      };

      if (!response.ok || !data.spec) {
        throw new Error(data.error ?? "AI generation failed.");
      }

      setSpec(data.spec);
      setAgentSource(data.source ?? "gemini");
      setAgentMessage(data.message ?? (data.source === "local-fallback" ? "Local fallback generated this spec." : "Gemini generated this GameSpec."));
    } catch (error) {
      setSpec(generateGame(prompt));
      setAgentSource("local-fallback");
      setAgentMessage(error instanceof Error ? error.message : "Local fallback generated this spec.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="border-b border-white/10">
        <div className="mx-auto grid min-h-[92vh] w-full max-w-7xl gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-10">
          <div className="flex flex-col gap-7">
            <nav className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded bg-electric text-ink shadow-glow">
                  <Wand2 size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-electric">ArbiGame Agent</p>
                  <p className="text-xs text-white/55">AI x Arbitrum game builder</p>
                </div>
              </div>
              <WalletConnectButton />
            </nav>

            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded border border-electric/35 bg-electric/10 px-3 py-2 text-sm text-electric">
                <Sparkles size={16} aria-hidden="true" />
                Built for Arbitrum Open House London Buildathon
              </div>
              <h1 className="text-5xl font-black leading-[0.98] text-white sm:text-6xl lg:text-7xl">
                Create Web3 Games on Arbitrum with AI
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
                Describe a game idea and generate a playable onchain game template for Arbitrum Sepolia.
              </p>
            </div>

            <PromptForm
              agentSource={agentSource}
              examples={examples}
              isGenerating={isGenerating}
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
            />
            <AgentTrace agentMessage={agentMessage} agentSource={agentSource} isGenerating={isGenerating} />
          </div>

          <GamePreview spec={spec} compact />
        </div>
      </section>

      <section className="bg-white/[0.03] px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <GameSpecPreview spec={spec} />
          <ContractCodeViewer code={contractCode} />
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <GamePreview spec={spec} />
          <HackathonPitchSection />
        </div>
      </section>
    </main>
  );
}
