"use client";

import { useMemo, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { ContractCodeViewer } from "@/components/ContractCodeViewer";
import { GamePreview } from "@/components/GamePreview";
import { GameSpecPreview } from "@/components/GameSpecPreview";
import { HackathonPitchSection } from "@/components/HackathonPitchSection";
import { PromptForm } from "@/components/PromptForm";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { generateDiceBattleContract } from "@/lib/diceBattleTemplate";
import { generateGame } from "@/lib/mockAgent";

const defaultPrompt =
  "Create a fantasy dice battle game where two players deposit 0.001 ETH and the winner takes the prize pool.";

const examples = [
  "Create a fantasy dice battle game where two players deposit 0.001 ETH and the winner takes the prize pool.",
  "Create a cyberpunk dice duel on Arbitrum with a neon UI and simple winner-takes-all rule.",
  "Create a two-player dice game for Arbitrum Sepolia with a medieval theme."
];

export default function Home() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [generatedPrompt, setGeneratedPrompt] = useState(defaultPrompt);

  const spec = useMemo(() => generateGame(generatedPrompt), [generatedPrompt]);
  const contractCode = useMemo(() => generateDiceBattleContract(spec), [spec]);

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
              examples={examples}
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={() => setGeneratedPrompt(prompt)}
            />
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
