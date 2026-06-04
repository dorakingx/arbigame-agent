"use client";

import { AlertTriangle, CheckCircle2, Coins, Crown, Dice5, RadioTower, RotateCcw, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatEther, parseEther, zeroAddress } from "viem";
import {
  useAccount,
  useConnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
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
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { switchChain } = useSwitchChain();
  const [lastAction, setLastAction] = useState<string>("Ready. Start a solo round when your wallet is connected.");

  const contractEnabled = Boolean(diceBattleAddress);
  const { data: entryFee, refetch: refetchEntryFee } = useReadContract({
    address: diceBattleAddress,
    abi: diceBattleAbi,
    functionName: "entryFee",
    query: { enabled: contractEnabled }
  });
  const { data: roundId, refetch: refetchRoundId } = useReadContract({
    address: diceBattleAddress,
    abi: diceBattleAbi,
    functionName: "roundId",
    query: { enabled: contractEnabled }
  });
  const { data: player, refetch: refetchPlayer } = useReadContract({
    address: diceBattleAddress,
    abi: diceBattleAbi,
    functionName: "player",
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
  const { data: roundSettled, refetch: refetchRoundSettled } = useReadContract({
    address: diceBattleAddress,
    abi: diceBattleAbi,
    functionName: "roundSettled",
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
  const normalizedPlayer = player?.toLowerCase();
  const normalizedWinner = winner?.toLowerCase();
  const hasPlayer = Boolean(player && player !== zeroAddress);
  const hasWinner = Boolean(winner && winner !== zeroAddress);
  const isPlayer = Boolean(normalizedAddress && normalizedAddress === normalizedPlayer);
  const isWinner = Boolean(normalizedAddress && normalizedWinner && normalizedWinner !== zeroAddress && normalizedAddress === normalizedWinner);
  const didLose = Boolean(isPlayer && roundSettled && hasRolled && !hasWinner);
  const isWrongChain = isConnected && chainId !== arbitrumSepolia.id;
  const displayEntryFee = entryFee ? formatEther(entryFee) : spec.entryFeeEth;
  const displayRoundId = roundId ? roundId.toString() : "0";
  const isBusy = isPending || isConfirming || isConnecting;
  const canStartRound = !hasPlayer || Boolean(roundSettled && (!hasWinner || prizeClaimed));
  const claimPending = Boolean(hasWinner && !prizeClaimed);

  const canSendLiveTx = contractEnabled && isConnected && !isWrongChain && !isBusy;
  const canUseStartButton = contractEnabled && !isBusy && canStartRound;
  const canJoin = canSendLiveTx && canStartRound;
  const canRoll = canSendLiveTx && isPlayer && !hasRolled && !roundSettled;
  const canClaim = canSendLiveTx && isWinner && !prizeClaimed;
  const startButtonLabel = !isConnected ? "Connect Wallet" : isWrongChain ? "Switch Network" : "Start Round";

  const statusText = useMemo(() => {
    if (!contractEnabled) {
      return "Live contract address is not configured yet.";
    }

    if (!isConnected) {
      return "Connect your wallet to start a solo round.";
    }

    if (isWrongChain) {
      return "Switch to Arbitrum Sepolia before sending a transaction.";
    }

    if (isPending) {
      return "Waiting for wallet confirmation...";
    }

    if (isConnecting) {
      return "Waiting for wallet connection...";
    }

    if (isConfirming) {
      return "Transaction submitted. Waiting for Arbitrum Sepolia confirmation...";
    }

    if (isConfirmed) {
      return `${lastAction} confirmed.`;
    }

    if (error) {
      return formatTransactionError(error);
    }

    if (canRoll) {
      return `Round ${displayRoundId}: you joined. Roll the dice to finish the round.`;
    }

    if (canClaim) {
      return `You rolled ${myRoll ?? "-"} and won. Claim the prize to finish.`;
    }

    if (didLose) {
      return `You rolled ${myRoll ?? "-"}. Round complete: no claim this time. Start another round.`;
    }

    if (claimPending) {
      return "A winning round is waiting for the winner to claim before a new round can start.";
    }

    if (canJoin) {
      return "Ready. Start a solo round with one wallet transaction.";
    }

    return lastAction;
  }, [
    canClaim,
    canJoin,
    canRoll,
    claimPending,
    contractEnabled,
    didLose,
    error,
    isConfirmed,
    isConfirming,
    isConnecting,
    isConnected,
    isPending,
    isWrongChain,
    lastAction,
    displayRoundId,
    myRoll,
  ]);

  useEffect(() => {
    if (!isConfirmed) {
      return;
    }

    void Promise.all([
      refetchEntryFee(),
      refetchRoundId(),
      refetchPlayer(),
      refetchWinner(),
      refetchPrizeClaimed(),
      refetchRoundSettled(),
      refetchHasRolled(),
      refetchMyRoll()
    ]);
  }, [
    isConfirmed,
    refetchEntryFee,
    refetchHasRolled,
    refetchMyRoll,
    refetchPlayer,
    refetchPrizeClaimed,
    refetchRoundId,
    refetchRoundSettled,
    refetchWinner
  ]);

  function ensureReady() {
    if (!diceBattleAddress || !contractEnabled) {
      setLastAction("Live contract address is not configured yet.");
      return false;
    }

    if (!isConnected) {
      const injectedConnector = connectors[0];
      if (injectedConnector) {
        setLastAction("Connect your wallet, then start the round.");
        connect({ connector: injectedConnector });
      } else {
        setLastAction("No browser wallet was found.");
      }
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

    setLastAction("Start Round");
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

        <div className="grid gap-3 sm:grid-cols-4">
          <Stat icon={<Coins size={16} />} label="Entry" value={`${displayEntryFee} ETH`} />
          <Stat icon={<Trophy size={16} />} label="Win Rule" value="Roll 4+" />
          <Stat icon={<Dice5 size={16} />} label="Players" value="1 only" />
          <Stat icon={<RotateCcw size={16} />} label="Round" value={`#${displayRoundId}`} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <StepCard
            step="1"
            title="Start"
            body="Deposit the entry fee and begin a solo round."
            state={canRoll || hasRolled ? "done" : canUseStartButton ? "active" : "locked"}
          />
          <StepCard
            step="2"
            title="Roll"
            body="Roll once. 4, 5, or 6 wins."
            state={hasRolled ? "done" : canRoll ? "active" : "locked"}
          />
          <StepCard
            step="3"
            title="Finish"
            body={canClaim ? "Claim your prize." : didLose ? "Round complete. Try again." : "Win to unlock claim."}
            state={prizeClaimed || didLose ? "done" : canClaim ? "active" : "locked"}
          />
        </div>

        <div className="mt-5 rounded border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white/82">Current result</h3>
            <span className="rounded border border-white/10 bg-[#0c101b] px-2 py-1 text-xs font-semibold text-white/58">
              {hasRolled ? `Roll: ${myRoll ?? "-"}` : "No roll yet"}
            </span>
          </div>
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
            disabled={!canUseStartButton}
          >
            {canStartRound ? startButtonLabel : "Round Active"}
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
            <p className="text-white/42">Next action</p>
            <p className="mt-1 font-semibold text-electric">{statusText}</p>
            {hash ? <p className="mt-2 truncate font-mono text-xs text-white/45">{hash}</p> : null}
          </div>
          <div className="rounded border border-white/10 bg-[#0c101b] p-3">
            <p className="text-white/42">Contract address</p>
            <p className="mt-1 truncate font-mono text-white/72">{diceBattleAddress ?? "Deploy pending"}</p>
            {hasWinner ? (
              <p className="mt-2 truncate text-xs text-white/45">Winner: {winner}</p>
            ) : hasRolled ? (
              <p className="mt-2 text-xs text-white/45">No winner. Roll was below 4.</p>
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

function StepCard({
  body,
  state,
  step,
  title
}: {
  body: string;
  state: "active" | "done" | "locked";
  step: string;
  title: string;
}) {
  const stateClasses = {
    active: "border-electric/60 bg-electric/10 text-electric",
    done: "border-emerald-400/45 bg-emerald-400/10 text-emerald-300",
    locked: "border-white/10 bg-white/[0.04] text-white/42"
  };

  return (
    <div className={`rounded border p-3 ${stateClasses[state]}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="grid h-7 w-7 place-items-center rounded bg-white/10 text-xs font-black">{step}</span>
        {state === "done" ? <CheckCircle2 size={16} aria-hidden="true" /> : null}
      </div>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-white/58">{body}</p>
    </div>
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

function formatTransactionError(error: Error) {
  const message = error.message;

  if (message.includes("Demo-only / unaudited")) {
    return "Wallet simulation used an old cached demo call. Hard refresh, confirm Arbitrum Sepolia, then try Start Round again.";
  }

  if (message.includes("User rejected") || message.includes("rejected the request")) {
    return "Wallet request was rejected.";
  }

  return message.split("\n").find(Boolean) ?? "Transaction failed. Check the wallet popup for details.";
}
