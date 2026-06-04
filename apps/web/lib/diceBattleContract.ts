import { isAddress, zeroAddress } from "viem";

export const diceBattleAbi = [
  {
    type: "function",
    name: "entryFee",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "roundId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "WINNING_ROLL",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }]
  },
  {
    type: "function",
    name: "player",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  },
  {
    type: "function",
    name: "winner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  },
  {
    type: "function",
    name: "prizeClaimed",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "roundSettled",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "rolls",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint8" }]
  },
  {
    type: "function",
    name: "hasRolled",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "joinGame",
    stateMutability: "payable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "rollDice",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "claimPrize",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "event",
    name: "PlayerJoined",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "DiceRolled",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "roll", type: "uint8", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "WinnerDecided",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "PrizeClaimed",
    inputs: [
      { name: "roundId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ],
    anonymous: false
  }
] as const;

const fallbackArbitrumSepoliaAddress = "0x8239C55b166831464Cc9AFd50b85e4a55B50e5aF";
const configuredAddress = process.env.NEXT_PUBLIC_DICE_BATTLE_ADDRESS;
const liveAddress = configuredAddress && isAddress(configuredAddress) ? configuredAddress : fallbackArbitrumSepoliaAddress;

export const diceBattleAddress = isAddress(liveAddress) ? liveAddress : undefined;

export const hasLiveDiceBattle = Boolean(diceBattleAddress && diceBattleAddress !== zeroAddress);
