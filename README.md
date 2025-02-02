# Onchain AI Agent with Discord & Uniswap V2 Integration

An autonomous blockchain AI agent that interacts with a custom vault contract on Sepolia to perform token swaps, query balances, and send tokens. 
The agent is integrated with Discord to receive user commands and uses the OpenAI API (Beta) to interpret instructions and call on-chain tools via Viem. 
This project demonstrates a full-stack solution for automated on-chain operations via a Discord bot interface. 
For ai agent part we used viem library for blockchain interaction and open ai for llm part  for reference and tailored them according to our project.

---



---

## Overview

This project implements an autonomous on-chain agent that supports a range of blockchain operations including token swaps, balance queries, and token transfers. The key components include:

- **A Vault Smart Contract (AIAgentVault.sol):**  
  A vault that holds two tokens (for example, YBTC and YU on Sepolia). Users deposit tokens into the vault, and an authorized AI agent can trigger swaps using Uniswap V2, as well as allow querying balances and sending tokens.

- **Backend (Node.js & TypeScript):**  
  Utilizes Viem for blockchain interactions, OpenAI for natural language processing, and integrates with a Discord bot to receive commands.

- **Discord Bot:**  
  Users send commands (e.g., `!swap 350 YU to YBTC`, `!balance 0xYourAddress`, or `!send 10 YU to 0xRecipient`) via Discord. The bot maps each Discord user to an on-chain wallet address and passes the command to the AI agent.

- **On-chain Tools:**  
  A suite of blockchain tools that include functionality to:
  - Approve token allowances.
  - Execute swaps via the vault.
  - Query the balance of an address.
  - Send tokens or ETH to an address.

---

## Features


- **Discord Integration:**  
  Interact with the AI agent via Discord commands.

- **AI-Powered Command Parsing:**  
  Uses OpenAI’s API to understand natural language commands and trigger appropriate on-chain operations.

- **On-Chain Swaps:**  
  Execute token swaps using a custom vault contract integrated with a Uniswap V2 router.

- **Query Balances:**  
  Check the ETH balance or ERC20 token balance of any address.

- **Token Transfers:**  
  Send ETH or tokens to a specified address by encoding a transfer call.

- **Token Address & Network Configuration:**  
  Uses specified token addresses for YBTC and YU on the Sepolia testnet.

- **Detailed Error Handling & Logging:**  
  Provides clear feedback if any on-chain operation fails (e.g., due to insufficient balance, allowance issues, or contract conditions).

---

## Architecture & Workflow
 ![WhatsApp Image 2025-02-02 at 08 38 43_91494aad](https://github.com/user-attachments/assets/f75e17e2-884d-4d88-beb4-b72a9459e95c)

1. **User Command:**  
   A user sends a command in Discord (e.g., `!swap 350 YU to YBTC`, `!balance 0xYourAddress`, or `!send 10 YU to 0xRecipient`).

2. **Discord Bot Processing:**  
   - The bot checks if the user has registered their on-chain wallet (using `!register 0x...`).
   - It then appends a system note with the registered address to the command and sends it to the AI agent.

3. **AI Assistant:**  
   - The agent processes the command using its system prompt and the available on-chain tools.
   - It selects the appropriate tool for the requested operation (swap, query balance, or send tokens).

4. **On-Chain Tool Execution:**  
   - Tools use Viem to create a wallet client (with the agent’s private key) and interact with the blockchain.
   - For swaps, the tool calls the vault’s `executeSwap` function.
   - For balance queries, the tool reads the balance from the chain.
   - For sending tokens, the tool encodes the ERC20 `transfer(address,uint256)` call and sends it.

5. **Response:**  
   - The tool returns a transaction hash or a query result, which the Discord bot sends back to the user.

---



### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/)
- [Viem](https://viem.sh/) for blockchain interactions
- A deployed vault contract on Sepolia (e.g., `AIAgentVault` deployed at `0xdfA8A83B0941F1d3ec47AD3BfEAE9D929E29b915`)
- Access to an Ethereum RPC endpoint on Sepolia (via [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/))
- An OpenAI API key (with access to Beta API features)
- A Discord bot token (and a Discord server where you’ve invited the bot)
## Installing requirements 
Run npm install
To install viem run npm i viem
To install openai run npm install openai
Then run npm run build 
and then npm run start
