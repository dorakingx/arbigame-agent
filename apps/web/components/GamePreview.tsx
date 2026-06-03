import { AlertTriangle, Coins, Crown, Dice5, RadioTower } from "lucide-react";
import type { GameSpec } from "@shared/types/GameSpec";

interface GamePreviewProps {
  spec: GameSpec;
  compact?: boolean;
}

const themeStyles = {
  fantasy: "from-emerald-400/20 via-violet/20 to-ember/20",
  cyberpunk: "from-electric/25 via-fuchsia-500/20 to-arbitrum/20",
  medieval: "from-amber-300/20 via-red-500/15 to-arbitrum/20",
  default: "from-arbitrum/20 via-electric/15 to-violet/20"
};

export function GamePreview({ spec, compact = false }: GamePreviewProps) {
  return (
    <section className={`rounded border border-white/12 bg-gradient-to-br ${themeStyles[spec.theme]} p-[1px] shadow-2xl`}>
      <div className="rounded bg-ink/90 p-5 backdrop-blur">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded border border-electric/35 bg-electric/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-electric">
              <RadioTower size={13} aria-hidden="true" />
              Target: Arbitrum Sepolia
            </p>
            <h2 className={compact ? "text-3xl font-black" : "text-4xl font-black"}>{spec.title}</h2>
            <p className="mt-2 text-sm capitalize text-white/58">{spec.theme} theme</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded bg-white text-ink">
            <Dice5 size={28} aria-hidden="true" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat icon={<Coins size={16} />} label="Entry" value={`${spec.entryFeeEth} ETH`} />
          <Stat icon={<Crown size={16} />} label="Prize" value="Winner takes all" />
          <Stat icon={<Dice5 size={16} />} label="Players" value="2 only" />
        </div>

        <div className="mt-5 rounded border border-white/10 bg-white/[0.04] p-4">
          <h3 className="mb-3 text-sm font-semibold text-white/82">Rules</h3>
          <ul className="space-y-2 text-sm text-white/68">
            {spec.rules.slice(0, compact ? 3 : spec.rules.length).map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button className="rounded bg-electric px-4 py-3 text-sm font-bold text-ink transition hover:bg-white" type="button">
            Join Game
          </button>
          <button className="rounded border border-white/14 bg-white/[0.07] px-4 py-3 text-sm font-bold text-white transition hover:border-electric" type="button">
            Roll Dice
          </button>
          <button className="rounded border border-ember/40 bg-ember/12 px-4 py-3 text-sm font-bold text-ember transition hover:bg-ember hover:text-ink" type="button">
            Claim Prize
          </button>
        </div>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded border border-white/10 bg-[#0c101b] p-3">
            <p className="text-white/42">Transaction status</p>
            <p className="mt-1 font-semibold text-electric">Preview mode, no transaction sent</p>
          </div>
          <div className="rounded border border-white/10 bg-[#0c101b] p-3">
            <p className="text-white/42">Contract address</p>
            <p className="mt-1 truncate font-mono text-white/72">0xDemo...ArbitrumSepolia</p>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded border border-ember/35 bg-ember/10 p-3 text-sm text-ember">
          <AlertTriangle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
          <p>Demo-only / unaudited. Pseudo-randomness is insecure and intended only for testnet demos.</p>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border border-white/10 bg-white/[0.05] p-3">
      <div className="mb-2 text-electric">{icon}</div>
      <p className="text-xs uppercase tracking-[0.16em] text-white/42">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}
