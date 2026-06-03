import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

export const arbitrumSepolia = defineChain({
  id: 421614,
  name: "Arbitrum Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia-rollup.arbitrum.io/rpc"]
    }
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://sepolia.arbiscan.io"
    }
  },
  testnet: true
});

export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia],
  connectors: [
    injected({
      target: "metaMask"
    }),
    injected()
  ],
  transports: {
    [arbitrumSepolia.id]: http()
  },
  ssr: true
});
