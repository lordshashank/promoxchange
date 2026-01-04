import { baseSepolia, base } from "wagmi/chains";
import type { Chain } from "viem";
import type { Network } from "@x402/core/types";

// Read network from environment variable (use NEXT_PUBLIC_ for client-side access)
const network = process.env.NEXT_PUBLIC_NETWORK || "base-sepolia";

// Chain configuration mapping
const chainMapping: Record<string, Chain> = {
  "base-sepolia": baseSepolia,
  base: base,
};

// Network ID mapping (x402 format)
const networkIdMapping: Record<string, Network> = {
  "base-sepolia": "eip155:84532",
  base: "eip155:8453",
};

// Export the active chain based on environment
export const activeChain: Chain = chainMapping[network] || baseSepolia;

// Export the network ID for x402
export const networkId: Network = networkIdMapping[network] || "eip155:84532";

// Export network name
export const networkName = network;
