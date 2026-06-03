"use client";

import { Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { arbitrumSepolia } from "@/lib/chains";

export function WalletConnectButton() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isWrongChain = isConnected && chainId !== arbitrumSepolia.id;
  const injectedConnector = connectors[0];
  const label = isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect Wallet";

  function handleClick() {
    if (!isConnected && injectedConnector) {
      connect({ connector: injectedConnector });
      return;
    }

    if (isWrongChain) {
      switchChain({ chainId: arbitrumSepolia.id });
      return;
    }

    disconnect();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 rounded border border-white/14 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white transition hover:border-electric hover:bg-electric hover:text-ink sm:px-4"
      title={isWrongChain ? "Switch to Arbitrum Sepolia" : isConnected ? "Disconnect wallet" : "Connect wallet"}
    >
      <Wallet size={17} aria-hidden="true" />
      <span className="hidden sm:inline">
        {isWrongChain ? "Switch Network" : isPending || isSwitching ? "Confirm..." : label}
      </span>
    </button>
  );
}
