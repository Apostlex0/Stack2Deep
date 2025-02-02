// src/agent/tools/executeVaultSwap.ts

import { ToolConfig } from "./allTools.js";
import { createViemWalletClient } from "../viem/createViemWalletClient.js";
import { AIAgentVault_ABI } from "../const/contractDetails.js";
import { Address, Hash } from "viem";
import "dotenv/config";

interface ExecuteVaultSwapArgs {
  vaultAddress: Address;
  user: Address;         // The user whose funds are swapped
  tokenIn: Address;      // e.g. YBTC or YU
  tokenOut: Address;     // e.g. YU or YBTC
  amountIn: string;      // Possibly in "raw" form; we'll scale it if needed
  minAmountOut: string;  // Possibly in "raw" form
  deadline: string;      // The deadline in UNIX seconds
}

function sanitizeSwapArgs(args: ExecuteVaultSwapArgs): {
  vaultAddress: Address;
  user: Address;
  tokenIn: Address;
  tokenOut: Address;
  amountIn: bigint;
  minAmountOut: bigint;
  deadline: bigint;
} {
  // Convert strings to BigInt
  const rawAmountIn = BigInt(args.amountIn || "0");
  const rawMinOut = BigInt(args.minAmountOut || "0");

  let scaledAmountIn = rawAmountIn;
  let scaledMinOut = rawMinOut;

  // If the raw amount is < 1e12, assume the AI provided a small non-wei number
  const threshold = 1_000_000_000_000n; // 1e12
  const scaleFactor = 1_000_000_000_000_000_000n; // 1e18

  if (scaledAmountIn > 0 && scaledAmountIn < threshold) {
    scaledAmountIn *= scaleFactor;
  }
  if (scaledMinOut > 0 && scaledMinOut < threshold) {
    scaledMinOut *= scaleFactor;
  }
  // If minAmountOut is zero, set it to 1 wei (avoid swapExactTokensForTokens failing with 0)
  if (scaledMinOut === 0n) {
    scaledMinOut = 1n;
  }

  // Handle deadline
  let deadlineBn: bigint;
  try {
    deadlineBn = BigInt(args.deadline);
  } catch {
    deadlineBn = 0n;
  }
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (deadlineBn < now) {
    deadlineBn = now + 900n; // default to now+15min
  }

  return {
    vaultAddress: args.vaultAddress,
    user: args.user,
    tokenIn: args.tokenIn,
    tokenOut: args.tokenOut,
    amountIn: scaledAmountIn,
    minAmountOut: scaledMinOut,
    deadline: deadlineBn,
  };
}

export const executeVaultSwapTool: ToolConfig<ExecuteVaultSwapArgs> = {
  definition: {
    type: "function",
    function: {
      name: "execute_vault_swap",
      description: "Call AIAgentVault.executeSwap to swap user's tokenIn -> tokenOut via Uniswap V2",
      parameters: {
        type: "object",
        properties: {
          vaultAddress: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{40}$",
            description: "Address of the deployed AIAgentVault",
          },
          user: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{40}$",
          },
          tokenIn: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{40}$",
          },
          tokenOut: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{40}$",
          },
          amountIn: {
            type: "string",
            description: "Amount of tokens to swap, possibly non-wei (will scale up).",
          },
          minAmountOut: {
            type: "string",
            description: "Minimum tokens out, also possibly non-wei (will scale).",
          },
          deadline: {
            type: "string",
            description: "Deadline (UNIX timestamp). If too low, we pick now+15min.",
          },
        },
        required: ["vaultAddress","user","tokenIn","tokenOut","amountIn","minAmountOut","deadline"],
      },
    },
  },
  handler: async (rawArgs) => {
    const {
      vaultAddress,
      user,
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
      deadline,
    } = sanitizeSwapArgs(rawArgs);

    const walletClient = createViemWalletClient();

    try {
      const hash: Hash = await walletClient.writeContract({
        address: vaultAddress,
        abi: AIAgentVault_ABI,
        functionName: "executeSwap",
        args: [
          user,
          tokenIn,
          tokenOut,
          amountIn,
          minAmountOut,
          deadline,
        ],
      });
      return `Swap executed successfully. Tx hash: ${hash}`;
    } catch (err: any) {
      return `Swap failed with error: ${err.message ?? String(err)}`;
    }
  },
};
