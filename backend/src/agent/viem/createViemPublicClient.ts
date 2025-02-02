import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains"; // or sepolia, mainnet, etc.
import "dotenv/config";

export function createViemPublicClient() {
  return createPublicClient({
    chain: sepolia,
    transport: http(),
  });
}
