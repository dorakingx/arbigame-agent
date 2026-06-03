import type { GameSpec, GameTheme } from "@shared/types/GameSpec";

const titleByTheme: Record<GameTheme, string> = {
  fantasy: "Dragon Dice Trial",
  cyberpunk: "Neon Solo Dice",
  medieval: "Knight's Solo Trial",
  default: "Arbitrum Solo Dice"
};

export function parsePromptToGameSpec(prompt: string): GameSpec {
  const normalized = prompt.toLowerCase();
  const theme = detectTheme(normalized);
  const entryFeeEth = extractEntryFee(normalized) ?? "0.001";

  return {
    gameType: "dice-battle",
    title: titleByTheme[theme],
    theme,
    playerCount: 1,
    entryFeeEth,
    prizeRule: "The solo player rolls once. A roll of 4 or higher wins and can claim the prize pool.",
    rules: [
      `One player joins by depositing ${entryFeeEth} ETH.`,
      "The player rolls one six-sided dice once.",
      "A roll of 4, 5, or 6 wins the solo challenge.",
      "A winning player can claim the contract prize pool.",
      "A roll of 1, 2, or 3 ends the demo round without a claimable prize."
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
