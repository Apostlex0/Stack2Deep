// uniswapV2createPair.ts

import { ToolConfig } from './allTools.js';
import { createViemWalletClient } from '../viem/createViemWalletClient.js';
import "dotenv/config";

/**
 * For Uniswap V2 on Sepolia, 
 * Factory address: 0xF62c03E08ada871A0bEb309762E260a7a6a880E6 (your example)
 * 
 * The relevant ABI: 
 *   function createPair(address tokenA, address tokenB) external returns (address pair);
 */
const FACTORY_ADDRESS = '0xF62c03E08ada871A0bEb309762E260a7a6a880E6';

// Minimal Uniswap V2 factory ABI for createPair
const FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "tokenA", "type": "address" },
      { "internalType": "address", "name": "tokenB", "type": "address" }
    ],
    "name": "createPair",
    "outputs": [{ "internalType": "address", "name": "pair", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

interface UniswapV2CreatePairArgs {
  tokenA: string;
  tokenB: string;
}

export const uniswapV2CreatePairTool: ToolConfig<UniswapV2CreatePairArgs> = {
  definition: {
    type: 'function',
    function: {
      name: 'create_uniswap_v2_pair',
      description: 'Create a new Uniswap V2 liquidity pair between two tokens',
      parameters: {
        type: 'object',
        properties: {
          tokenA: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40}$',
            description: 'Address of the first token'
          },
          tokenB: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40}$',
            description: 'Address of the second token'
          }
        },
        required: ['tokenA','tokenB']
      }
    }
  },
  handler: async ({ tokenA, tokenB }) => {
    const walletClient = createViemWalletClient();

    // Write to the Uniswap V2 Factory: createPair(tokenA, tokenB)
    const hash = await walletClient.writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createPair',
      args: [tokenA as `0x${string}`, tokenB as `0x${string}`]
    });

    return `Tx submitted to createPair(${tokenA}, ${tokenB}). Hash: ${hash}`;
  }
};
