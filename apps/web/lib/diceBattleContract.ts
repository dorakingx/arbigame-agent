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
    name: "player1",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }]
  },
  {
    type: "function",
    name: "player2",
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
    inputs: [{ name: "player", type: "address", indexed: true }],
    anonymous: false
  },
  {
    type: "event",
    name: "DiceRolled",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "roll", type: "uint8", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "WinnerDecided",
    inputs: [{ name: "winner", type: "address", indexed: true }],
    anonymous: false
  },
  {
    type: "event",
    name: "PrizeClaimed",
    inputs: [
      { name: "winner", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ],
    anonymous: false
  }
] as const;

const configuredAddress = process.env.NEXT_PUBLIC_DICE_BATTLE_ADDRESS;

export const diceBattleAddress =
  configuredAddress && isAddress(configuredAddress) ? configuredAddress : undefined;

export const hasLiveDiceBattle = Boolean(diceBattleAddress && diceBattleAddress !== zeroAddress);
