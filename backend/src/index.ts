// src/index.ts
import 'dotenv/config';
import { startDiscordBot } from './discord/discordBot.js';

async function main() {
  await startDiscordBot();
}

main().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
