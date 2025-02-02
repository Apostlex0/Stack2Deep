// writeContract.ts

import { Address, Hash } from 'viem';
import { createViemWalletClient } from '../viem/createViemWalletClient.js';
import { ToolConfig } from './allTools.js';
import "dotenv/config";

interface WriteContractArgs {
  address: Address;
  abi: any[];
  functionName: string;
  args?: any[];
}

export const writeContractTool: ToolConfig<WriteContractArgs> = {
  definition: {
    type: 'function',
    function: {
      name: 'write_contract',
      description: 'Execute a state-changing (write) function on a smart contract.',
      parameters: {
        type: 'object',
        properties: {
          address: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40}$',
            description: 'Contract address to interact with.',
          },
          abi: {
            type: 'array',
            description: 'Contract ABI (Application Binary Interface).',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                name: { type: 'string' },
                inputs: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' }
                    }
                  }
                },
                outputs: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' }
                    }
                  }
                },
                stateMutability: { type: 'string' }
              }
            }
          },
          functionName: {
            type: 'string',
            description: 'The name of the contract function to call.'
          },
          args: {
            type: 'array',
            description: 'Arguments to pass to the function (optional).',
            items: {
              type: 'string',
              description: 'Each argument as a string (will be parsed for actual type).'
            },
            optional: true
          }
        },
        required: ['address', 'abi', 'functionName']
      }
    }
  },
  handler: async ({ address, abi, functionName, args = [] }) => {
    return await writeContract({ address, abi, functionName, args });
  }
};

/**
 * Internal helper to actually send the contract interaction tx using viem.
 */
export async function writeContract({
  address,
  abi,
  functionName,
  args
}: WriteContractArgs): Promise<Hash> {
  const walletClient = createViemWalletClient();

  const hash = await walletClient.writeContract({
    address,
    abi,
    functionName,
    args: args ?? []
  });

  return hash;
}
