import type { GameSpec } from "@shared/types/GameSpec";
import { parsePromptToGameSpec } from "./gameSpecParser";

export interface GameGenerationAgent {
  generate(prompt: string): GameSpec;
}

export const mockAgent: GameGenerationAgent = {
  generate(prompt) {
    return parsePromptToGameSpec(prompt);
  }
};

export function generateGame(prompt: string): GameSpec {
  return mockAgent.generate(prompt);
}
