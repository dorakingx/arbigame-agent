export type GameTheme = "fantasy" | "cyberpunk" | "medieval" | "default";

export interface GameSpec {
  gameType: "dice-battle";
  title: string;
  theme: GameTheme;
  playerCount: 2;
  entryFeeEth: string;
  prizeRule: string;
  rules: string[];
  targetChain: "Arbitrum Sepolia";
  chainId: 421614;
  hackathonContext: "Arbitrum Open House London Buildathon";
}
