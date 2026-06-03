"use client";

import { AlertTriangle, Coins, Crown, Dice5, RadioTower } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatEther, parseEther, zeroAddress } from "viem";
import { useAccount, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { arbitrumSepolia } from "@/lib/chains";
import { diceBattleAbi, diceBattleAddress } from "@/lib/diceBattleContract";
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
  const { address, chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [lastAction, setLastAction] = useState<string>("Ready for live Arbitrum Sepolia demo.");

  const contractEnabled = Boolean(diceBattleAddress);
  const { data: entryFee, refetch: refetchEntryFee } = useReadContract({
    address: diceBattleAddress,
    abi: diceBattleAbi,
    functionName: "entryFee",
    query: { enabled: contractEnabled }
  });
  const { data: player1, refetch: refetchPlayer1 } = useReadContract({
    address: diceBattleAddress,
    abi: diceBattleAbi,
    functionName: "player1",
    query: { enabled: contractEnabled }
  });
  const { data: player2, refetch: refetchPlayer2 } = useReadContract({
    address: diceBattleAddress,
    abi: diceBattleAbi,
    functionName: "player2",
    query: { enabled: contractEnabled }
  });
  const { data: winner, refetch: refetchWinner } = useReadContract({
    address: diceBattleAddress,
    abi: diceBattleAbi,
    functionName: "winner",
    query: { enabled: contractEnabled }
  });
  const { data: prizeClaimed, refetch: refetchPrizeClaimed } = useReadContract({
    address: diceBattleAddress,
    abi: diceBattleAbi,
    functionName: "prizeClaimed",
    query: { enabled: contractEnabled }
  });
  const { data: hasRolled, refetch: refetchHasRolled } = useReadContract({
    address: diceBattleAddress,
    abi: diceBattleAbi,
    functionName: "hasRolled",
    args: address ? [address] : undefined,
    query: { enabled: contractEnabled && Boolean(address) }
  });
  const { data: myRoll, refetch: refetchMyRoll } = useReadContract({
    address: diceBattleAddress,
    abi: diceBattleAbi,
    functionName: "rolls",
    args: address ? [address] : undefined,
    query: { enabled: contractEnabled && Boolean(address) }
  });

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const normalizedAddress = address?.toLowerCase();
  const normalizedPlayer1 = player1?.toLowerCase();
  const normalizedPlayer2 = player2?.toLowerCase();
  const normalizedWinner = winner?.toLowerCase();
  const hasPlayer1 = Boolean(player1 && player1 !== zeroAddress);
  const hasPlayer2 = Boolean(player2 && player2 !== zeroAddress);
  const isFull = hasPlayer1 && hasPlayer2;
  const isPlayer = Boolean(normalizedAddress && (normalizedAddress === normalizedPlayer1 || normalizedAddress === normalizedPlayer2));
  const isWinner = Boolean(normalizedAddress && normalizedWinner && normalizedWinner !== zeroAddress && normalizedAddress === normalizedWinner);
  const isWrongChain = isConnected && chainId !== arbitrumSepolia.id;
  const displayEntryFee = entryFee ? formatEther(entryFee) : spec.entryFeeEth;
  const isBusy = isPending || isConfirming;

  const statusText = useMemo(() => {
    if (!contractEnabled) {
      return "Deploy DiceBattle and set NEXT_PUBLIC_DICE_BATTLE_ADDRESS to enable live transactions.";
    }

    if (!isConnected) {
      return "Connect a wallet to play against the deployed Arbitrum Sepolia contract.";
    }

    if (isWrongChain) {
      return "Switch to Arbitrum Sepolia before sending a transaction.";
    }

    if (isPending) {
      return "Waiting for wallet confirmation...";
    }

    if (isConfirming) {
      return "Transaction submitted. Waiting for Arbitrum Sepolia confirmation...";
    }

    if (isConfirmed) {
      return `${lastAction} confirmed on Arbitrum Sepolia.`;
    }

    if (error) {
      return error.message.split("\n")[0];
    }

    return lastAction;
  }, [contractEnabled, error, isConfirmed, isConfirming, isConnected, isPending, isWrongChain, lastAction]);

  useEffect(() => {
    if (!isConfirmed) {
      return;
    }

    void Promise.all([
      refetchEntryFee(),
      refetchPlayer1(),
      refetchPlayer2(),
      refetchWinner(),
      refetchPrizeClaimed(),
      refetchHasRolled(),
      refetchMyRoll()
    ]);
  }, [
    isConfirmed,
    refetchEntryFee,
    refetchHasRolled,
    refetchMyRoll,
    refetchPlayer1,
    refetchPlayer2,
    refetchPrizeClaimed,
    refetchWinner
  ]);

  function ensureReady() {
    if (!diceBattleAddress || !contractEnabled) {
      setLastAction("Live contract address is not configured yet.");
      return false;
    }

    if (!isConnected) {
      setLastAction("Connect a wallet first.");
      return false;
    }

    if (isWrongChain) {
      switchChain({ chainId: arbitrumSepolia.id });
      return false;
    }

    return true;
  }

  function joinGame() {
    if (!ensureReady() || !diceBattleAddress) {
      return;
    }

    setLastAction("Join Game");
    writeContract({
      address: diceBattleAddress,
      abi: diceBattleAbi,
      functionName: "joinGame",
      value: entryFee ?? parseEther(spec.entryFeeEth)
    });
  }

  function rollDice() {
    if (!ensureReady() || !diceBattleAddress) {
      return;
    }

    setLastAction("Roll Dice");
    writeContract({
      address: diceBattleAddress,
      abi: diceBattleAbi,
      functionName: "rollDice"
    });
  }

  function claimPrize() {
    if (!ensureReady() || !diceBattleAddress) {
      return;
    }

    setLastAction("Claim Prize");
    writeContract({
      address: diceBattleAddress,
      abi: diceBattleAbi,
      functionName: "claimPrize"
    });
  }

  const canSendLiveTx = contractEnabled && isConnected && !isWrongChain && !isBusy;
  const canJoin = canSendLiveTx && !isPlayer && !isFull;
  const canRoll = canSendLiveTx && isPlayer && isFull && !hasRolled && (!winner || winner === zeroAddress);
  const canClaim = canSendLiveTx && isWinner && !prizeClaimed;

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
          <Stat icon={<Coins size={16} />} label="Entry" value={`${displayEntryFee} ETH`} />
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
          <button
            className="rounded bg-electric px-4 py-3 text-sm font-bold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/35"
            type="button"
            onClick={joinGame}
            disabled={!canJoin}
          >
            {isFull ? "Game Full" : "Join Game"}
          </button>
          <button
            className="rounded border border-white/14 bg-white/[0.07] px-4 py-3 text-sm font-bold text-white transition hover:border-electric disabled:cursor-not-allowed disabled:text-white/35"
            type="button"
            onClick={rollDice}
            disabled={!canRoll}
          >
            {hasRolled ? `Rolled ${myRoll ?? "-"}` : "Roll Dice"}
          </button>
          <button
            className="rounded border border-ember/40 bg-ember/12 px-4 py-3 text-sm font-bold text-ember transition hover:bg-ember hover:text-ink disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.04] disabled:text-white/35"
            type="button"
            onClick={claimPrize}
            disabled={!canClaim}
          >
            Claim Prize
          </button>
        </div>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded border border-white/10 bg-[#0c101b] p-3">
            <p className="text-white/42">Transaction status</p>
            <p className="mt-1 font-semibold text-electric">{statusText}</p>
            {hash ? <p className="mt-2 truncate font-mono text-xs text-white/45">{hash}</p> : null}
          </div>
          <div className="rounded border border-white/10 bg-[#0c101b] p-3">
            <p className="text-white/42">Contract address</p>
            <p className="mt-1 truncate font-mono text-white/72">{diceBattleAddress ?? "Deploy pending"}</p>
            {winner && winner !== zeroAddress ? (
              <p className="mt-2 truncate text-xs text-white/45">Winner: {winner}</p>
            ) : null}
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
