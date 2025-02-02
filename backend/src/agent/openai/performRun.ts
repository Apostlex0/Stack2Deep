import OpenAI from "openai";
import { Thread } from "openai/resources/beta/threads/threads";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { handleRunToolCalls } from "./handleRunToolCalls.js";
import "dotenv/config";
export async function performRun(run: Run, client: OpenAI, thread: Thread) {
  while (run.status === "requires_action") {
    run = await handleRunToolCalls(run, client, thread);
  }

  if (run.status === "failed") {
    const errMsg = run.last_error?.message || "Unknown error";
    await client.beta.threads.messages.create(thread.id, {
      role: "assistant",
      content: `I encountered an error: ${errMsg}`,
    });
    return { type: "text", text: { value: errMsg } };
  }

  const msgs = await client.beta.threads.messages.list(thread.id);
  const assistantMsg = msgs.data.find(m => m.role === "assistant");
  if (!assistantMsg) {
    return { type: "text", text: { value: "No response from assistant" } };
  }
  return assistantMsg.content[0];
}
