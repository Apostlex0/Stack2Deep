// src/discord/discordBot.ts

import { Client, GatewayIntentBits, Partials } from 'discord.js';
import OpenAI from 'openai';
import { createAssistant } from '../agent/openai/createAssistant.js';
import { createThread } from '../agent/openai/createThread.js';
import { createRun } from '../agent/openai/createRun.js';
import { performRun } from '../agent/openai/performRun.js';
import "dotenv/config";

// In-memory mapping: Discord user ID => user’s Ethereum address
const userWalletMap: Record<string, string> = {};

let openaiClient: OpenAI | null = null;
let assistantId: string | null = null;

export async function startDiscordBot() {
  const discordClient = new Client({
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  discordClient.once('ready', async () => {
    console.log(`Discord bot logged in as ${discordClient.user?.tag}`);

    // Initialize OpenAI
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // Create the AI Assistant once
    const assistant = await createAssistant(openaiClient);
    assistantId = assistant.id;
    console.log(`Created AI Assistant: ${assistant.name} (${assistant.id})`);
  });

  discordClient.on('messageCreate', async (message) => {
    // Ignore bot messages or those without the "!" prefix
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;

    // 1) Parse the command (remove '!', split by whitespace)
    const userCommand = message.content.slice(1).trim(); 
    const args = userCommand.split(/\s+/);
    const userId = message.author.id; 

    try {
      if (!openaiClient || !assistantId) {
        await message.reply("AI assistant not ready yet. Please wait.");
        return;
      }

      // ------------------------------------------------------------------
      // Handle "!register <address>" locally 
      // ------------------------------------------------------------------
      if (args[0].toLowerCase() === 'register') {
        if (args.length < 2) {
          await message.reply("Usage: `!register 0xYourAddressHere`");
          return;
        }

        const userAddress = args[1];
        if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
          await message.reply("Invalid address format. Must be 0x + 40 hex chars.");
          return;
        }

        // Store in our in-memory map
        userWalletMap[userId] = userAddress;
        await message.reply(`✅ Registered your address: ${userAddress}`);
        return;
      }

      // ------------------------------------------------------------------
      // If command is "swap", inject a system note with the user's address
      // ------------------------------------------------------------------
      if (args[0].toLowerCase() === 'swap') {
        const storedAddress = userWalletMap[userId];
        if (!storedAddress) {
          await message.reply("❌ No registered wallet address. Use `!register 0x...` first.");
          return;
        }

        // Insert a system note so the AI sees the user's actual wallet address
        const finalUserMessage = `
${userCommand}

[System note: The Discord user is mapped to on-chain address: ${storedAddress}]
        `;

        const thread = await createThread(openaiClient, finalUserMessage);
        const run = await createRun(openaiClient, thread, assistantId);
        const result = await performRun(run, openaiClient, thread);

        if (result && result.type === 'text') {
          await message.reply(`**AI**: ${result.text.value}`);
        } else {
          await message.reply(`No textual response from AI (possibly tool calls only).`);
        }
        return;
      }

      // ------------------------------------------------------------------
      // Otherwise, pass the command to the AI as-is
      // ------------------------------------------------------------------
      const thread = await createThread(openaiClient, userCommand);
      const run = await createRun(openaiClient, thread, assistantId);
      const result = await performRun(run, openaiClient, thread);

      if (result && result.type === 'text') {
        await message.reply(`**AI**: ${result.text.value}`);
      } else {
        await message.reply(`No textual response from AI.`);
      }

    } catch (error: any) {
      console.error("Error in onMessage:", error);
      await message.reply(`Error: ${error.message}`);
    }
  });

  // Finally, login the bot
  await discordClient.login(process.env.DISCORD_BOT_TOKEN);
}
