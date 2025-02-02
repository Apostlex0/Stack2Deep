import OpenAI from "openai";
import { Thread } from "openai/resources/beta/threads/threads";
import "dotenv/config";
export async function createThread(client: OpenAI, userMessage?: string): Promise<Thread> {
  const thread = await client.beta.threads.create();

  if (userMessage) {
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage,
    });
  }

  return thread;
}
