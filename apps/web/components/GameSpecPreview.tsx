import { ClipboardList } from "lucide-react";
import type { GameSpec } from "@shared/types/GameSpec";

interface GameSpecPreviewProps {
  spec: GameSpec;
}

export function GameSpecPreview({ spec }: GameSpecPreviewProps) {
  return (
    <section className="rounded border border-white/12 bg-ink/75 p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded bg-arbitrum text-white">
          <ClipboardList size={18} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold">GameSpec</h2>
          <p className="text-sm text-white/55">Structured output from the mock agent</p>
        </div>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <SpecItem label="Game Type" value={spec.gameType} />
        <SpecItem label="Title" value={spec.title} />
        <SpecItem label="Theme" value={spec.theme} />
        <SpecItem label="Players" value={String(spec.playerCount)} />
        <SpecItem label="Entry Fee" value={`${spec.entryFeeEth} ETH`} />
        <SpecItem label="Target Chain" value={spec.targetChain} />
        <SpecItem label="Chain ID" value={String(spec.chainId)} />
        <SpecItem label="Prize Rule" value={spec.prizeRule} />
      </dl>

      <div className="mt-5 rounded border border-white/10 bg-white/[0.04] p-4">
        <h3 className="mb-3 text-sm font-semibold text-white/80">Rules</h3>
        <ul className="space-y-2 text-sm text-white/68">
          {spec.rules.map((rule) => (
            <li key={rule} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-electric" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/10 bg-white/[0.04] p-3">
      <dt className="text-xs uppercase tracking-[0.16em] text-white/42">{label}</dt>
      <dd className="mt-1 font-semibold text-white">{value}</dd>
    </div>
  );
}
