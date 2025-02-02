import OpenAI from "openai";
import { Assistant } from "openai/resources/beta/assistants";
import { tools } from "../tools/allTools.js";
import { assistantPrompt } from "./prompt.js";
import "dotenv/config";
export async function createAssistant(client: OpenAI): Promise<Assistant> {
  const assistant = await client.beta.assistants.create({
    model: "gpt-4o",
    name: "AIAgent",
    instructions: assistantPrompt,
    tools: Object.values(tools).map(tool => tool.definition),
  });
  return assistant;
}
