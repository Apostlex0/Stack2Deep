import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import "dotenv/config";


export function createViemWalletClient() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in .env");
  }
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

  return createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  }); // remove if not using zkSync
}
