# ArbiGame Agent

Create Web3 games on Arbitrum with AI.

ArbiGame Agent is a hackathon MVP that turns a natural-language game idea into a safe, template-based onchain game starter for Arbitrum Sepolia. The first version generates a single-player Dice Battle game with Solidity contracts, a live wallet-enabled frontend, tests, and deployment instructions.

## Built for Arbitrum Open House London Buildathon

ArbiGame Agent helps creators and developers rapidly prototype onchain games for the Arbitrum ecosystem. It is designed as a demo-ready developer tool: easy to understand, Arbitrum-native, visually clear, and technically feasible within a short Buildathon timeline.

## Problem

Building Web3 games requires smart contract knowledge, frontend integration, wallet support, testing, and deployment expertise. This creates a high barrier for creators and small teams.

## Solution

ArbiGame Agent lets users describe a game idea in natural language and generates a safe, template-based Arbitrum game starter with Solidity contracts, frontend UI, tests, and deployment instructions.

## Why Arbitrum

Arbitrum provides Ethereum-compatible infrastructure with lower-cost execution, making it suitable for experimental onchain games, consumer applications, and rapid Web3 prototyping.

## MVP Features

- Natural-language prompt input for Web3 game ideas.
- Mock AI agent that works without an API key.
- Structured `GameSpec` output.
- Safe Dice Battle Solidity template.
- Arbitrum Sepolia wallet and network configuration.
- Generated contract code viewer.
- Wallet-enabled one-player Dice Battle UI for Join, Roll, and Claim transactions.
- Deployed-contract address support through `NEXT_PUBLIC_DICE_BATTLE_ADDRESS`.
- Agent pipeline trace that shows prompt parsing, safe-template selection, and Arbitrum file preparation.
- Hardhat tests for core contract behavior.
- Deployment script for Arbitrum Sepolia.
- Replayable solo rounds so hackathon judges can start a fresh round without redeploying.
- Step-by-step game panel that shows Start, Roll, Finish, current roll, and next action.
- Demo-only and unaudited warnings throughout the app.

## Buildathon Demo Flow

Prompt -> GameSpec -> Smart Contract -> Wallet Game UI -> Arbitrum Sepolia Transaction -> Tests -> Deployment Instructions

Example prompts:

- "Create a fantasy solo dice battle game where one player deposits 0.001 ETH and wins on 4 or higher."
- "Create a cyberpunk one-player dice challenge on Arbitrum with a neon UI."
- "Create a solo medieval dice trial for Arbitrum Sepolia."

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Wallet tooling: wagmi, viem
- Smart contracts: Solidity `^0.8.24`
- Contract framework: Hardhat
- Target chain: Arbitrum Sepolia
- Chain ID: `421614`
- Native currency: ETH
- AI layer: mock generator abstraction for the MVP

## Setup

```bash
npm install
```

## Run Frontend

```bash
npm run dev
```

Then open `http://localhost:3000`.

For live contract interactions, create `apps/web/.env.local`:

```bash
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_DICE_BATTLE_ADDRESS=0xYourDeployedDiceBattle
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
```

`GEMINI_API_KEY` is only read by the Next.js API route and is never exposed to the browser. If it is not set, the app falls back to the local safe GameSpec generator.

## Run Contract Tests

```bash
npm test
```

## Deploy to Arbitrum Sepolia

Create `contracts/.env` from `contracts/.env.example`:

```bash
ARBITRUM_SEPOLIA_RPC_URL=
PRIVATE_KEY=
```

Then run:

```bash
npm run deploy:arbitrum-sepolia
```

The deployment script deploys `DiceBattle` with a default entry fee of `0.001 ETH`.
It prints the `NEXT_PUBLIC_DICE_BATTLE_ADDRESS` value that should be copied into the frontend and Vercel project environment variables.

## Vercel Deployment

This repo includes `vercel.json` for the monorepo layout. The production frontend builds from the root and outputs the Next.js app from `apps/web/.next`.

After deploying the contract, set this environment variable in Vercel:

```bash
NEXT_PUBLIC_DICE_BATTLE_ADDRESS=0xYourDeployedDiceBattle
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
```

Then redeploy:

```bash
vercel deploy --prod
```

## Live Demo Notes

Deployed DiceBattle contract:

```txt
Arbitrum Sepolia: 0x8239C55b166831464Cc9AFd50b85e4a55B50e5aF
Explorer: https://sepolia.arbiscan.io/address/0x8239C55b166831464Cc9AFd50b85e4a55B50e5aF
```

The live game UI expects:

- A browser wallet such as MetaMask.
- Arbitrum Sepolia selected in the wallet.
- Testnet ETH for the entry fee and gas.
- A deployed `DiceBattle` contract address configured through `NEXT_PUBLIC_DICE_BATTLE_ADDRESS`.

When configured, the buttons call the actual contract methods:

- `joinGame()` with the onchain `entryFee`.
- `rollDice()` after the solo player has joined.
- `claimPrize()` when the connected wallet rolled 4 or higher.

You can also run an end-to-end playtest from the terminal:

```bash
DICE_BATTLE_ADDRESS=0xYourDeployedDiceBattle npm run play:arbitrum-sepolia
```

End-to-end Sepolia playtest:

```txt
Playtest contract: 0x832Da4c265c2CF1C8625D21F40F4a55E0Fc7F294
Result: joined round 1, rolled 6, claimed prize successfully.
```

## Security Disclaimer

This MVP is demo-only, unaudited, and not suitable for real funds. The Dice Battle contract uses pseudo-randomness based on block data for testnet demonstration purposes. That randomness is insecure and must be replaced with a production-grade randomness source before any real deployment.

## Future Roadmap

- Add more game templates.
- Add real LLM integration.
- Add one-click deployment.
- Add NFT rewards.
- Add onchain tournament mode.
- Add creator revenue sharing.
- Add AI-assisted smart contract testing and security checks.
