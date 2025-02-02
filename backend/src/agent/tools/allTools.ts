// src/agent/tools/allTools.ts

import { getBalanceTool } from './getBalance.js';
import { getWalletAddressTool } from './getWalletAddress.js';
import { readContractTool } from './readContract.js';
import { sendTransactionTool } from './sendTransaction.js';
import { writeContractTool } from './writeContract.js';
import { getContractAbiTool } from './getContractAbi.js';
import { getTransactionReceiptTool } from './getTransactionReceipt.js';
import { deployErc20Tool } from './deployErc20.js';
import { approveTokenAllowanceTool } from './approveTokenAllowance.js';
import { getTokenBalanceTool } from './getTokenBalance.js';
import { uniswapV2CreatePairTool } from './uniswapV2createPair.js';

// The missing import:
import { executeVaultSwapTool } from './executeVaultSwap.js';

export interface ToolConfig<T = any> {
    definition: {
        type: 'function';
        function: {
            name: string;
            description: string;
            parameters: {
                type: 'object';
                properties: Record<string, unknown>;
                required: string[];
            };
        };
    };
    handler: (args: T) => Promise<any>;
}

export const tools: Record<string, ToolConfig> = {
    // == READ == \\
    get_balance: getBalanceTool,
    get_wallet_address: getWalletAddressTool,
    get_contract_abi: getContractAbiTool,
    read_contract: readContractTool,
    get_transaction_receipt: getTransactionReceiptTool,
    get_token_balance: getTokenBalanceTool,

    // == WRITE == \\
    send_transaction: sendTransactionTool,
    write_contract: writeContractTool,
    deploy_erc20: deployErc20Tool,
    approve_token_allowance: approveTokenAllowanceTool,

    // == Uniswap V2 CREATE PAIR == \\
    create_uniswap_v2_pair: uniswapV2CreatePairTool,

    // == The missing swap tool == \\
    execute_vault_swap: executeVaultSwapTool,
};
