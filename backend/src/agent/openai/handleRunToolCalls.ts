import OpenAI from "openai";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Thread } from "openai/resources/beta/threads/threads";
import { tools } from "../tools/allTools.js";
import "dotenv/config";
export async function handleRunToolCalls(run: Run, client: OpenAI, thread: Thread): Promise<Run> {
  const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls;
  if (!toolCalls) return run;

  const toolOutputs = await Promise.all(
    toolCalls.map(async (call) => {
      const config = tools[call.function.name];
      if (!config) {
        // Tool not found
        return {
          tool_call_id: call.id,
          output: `Error: Tool "${call.function.name}" not found.`
        };
      }
      try {
        const args = JSON.parse(call.function.arguments);
        const result = await config.handler(args);
        return {
          tool_call_id: call.id,
          output: String(result),
        };
      } catch (err: any) {
        return {
          tool_call_id: call.id,
          output: `Error: ${err.message}`,
        };
      }
    })
  );

  return client.beta.threads.runs.submitToolOutputsAndPoll(thread.id, run.id, {
    tool_outputs: toolOutputs
  });
}
