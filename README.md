# ArbiGame Agent

Create Web3 games on Arbitrum with AI.

ArbiGame Agent is a hackathon MVP that turns a natural-language game idea into a safe, template-based onchain game starter for Arbitrum Sepolia. The first version generates a two-player Dice Battle game with Solidity contracts, a frontend preview, tests, and deployment instructions.

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
- Playable-looking frontend preview.
- Hardhat tests for core contract behavior.
- Deployment script for Arbitrum Sepolia.
- Demo-only and unaudited warnings throughout the app.

## Buildathon Demo Flow

Prompt -> GameSpec -> Smart Contract -> Frontend Preview -> Tests -> Arbitrum Sepolia Deployment Instructions

Example prompts:

- "Create a fantasy dice battle game where two players deposit 0.001 ETH and the winner takes the prize pool."
- "Create a cyberpunk dice duel on Arbitrum with a neon UI and simple winner-takes-all rule."
- "Create a two-player dice game for Arbitrum Sepolia with a medieval theme."

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
