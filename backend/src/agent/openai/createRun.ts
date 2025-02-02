import OpenAI from "openai";
import { Thread } from "openai/resources/beta/threads/threads";
import { Run } from "openai/resources/beta/threads/runs/runs";
import "dotenv/config";
export async function createRun(client: OpenAI, thread: Thread, assistantId: string): Promise<Run> {
  let run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  });

  // Wait until run is not "in_progress" or "queued"
  while (run.status === "in_progress" || run.status === "queued") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await client.beta.threads.runs.retrieve(thread.id, run.id);
  }

  return run;
}
