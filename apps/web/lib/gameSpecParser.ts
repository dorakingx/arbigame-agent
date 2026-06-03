import type { GameSpec, GameTheme } from "@shared/types/GameSpec";

const titleByTheme: Record<GameTheme, string> = {
  fantasy: "Dragon Dice Duel",
  cyberpunk: "Neon Dice Clash",
  medieval: "Knight's Dice Trial",
  default: "Arbitrum Dice Battle"
};

export function parsePromptToGameSpec(prompt: string): GameSpec {
  const normalized = prompt.toLowerCase();
  const theme = detectTheme(normalized);
  const entryFeeEth = extractEntryFee(normalized) ?? "0.001";

  return {
    gameType: "dice-battle",
    title: titleByTheme[theme],
    theme,
    playerCount: 2,
    entryFeeEth,
    prizeRule: "Winner takes the full prize pool after both players roll once.",
    rules: [
      `Two players join by depositing ${entryFeeEth} ETH each.`,
      "Each player can roll one six-sided dice once after both players have joined.",
      "The higher dice roll wins the prize pool.",
      "If both players roll the same number, the demo contract uses a deterministic tiebreaker.",
      "The winner claims the pooled ETH from the contract."
    ],
    targetChain: "Arbitrum Sepolia",
    chainId: 421614,
    hackathonContext: "Arbitrum Open House London Buildathon"
  };
}

function detectTheme(normalizedPrompt: string): GameTheme {
  if (normalizedPrompt.includes("fantasy")) {
    return "fantasy";
  }

  if (normalizedPrompt.includes("cyberpunk")) {
    return "cyberpunk";
  }

  if (normalizedPrompt.includes("medieval")) {
    return "medieval";
  }

  return "default";
}

function extractEntryFee(normalizedPrompt: string): string | undefined {
  const match = normalizedPrompt.match(/(\d+(?:\.\d+)?)\s*eth\b/);
  return match?.[1];
}
