import { Wallet } from "lucide-react";

export function WalletConnectButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded border border-white/14 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white transition hover:border-electric hover:bg-electric hover:text-ink sm:px-4"
      title="Wallet connection placeholder"
    >
      <Wallet size={17} aria-hidden="true" />
      <span className="hidden sm:inline">Connect Wallet</span>
    </button>
  );
}
