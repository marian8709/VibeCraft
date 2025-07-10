import { gemini, createAgent } from "@inngest/agent-kit";
import { inngest } from "./client";

export const generateCode = inngest.createFunction(
  { id: "generate-code" },
  { event: "test/generate.code" },
  async ({ event }) => {
    // Create a new agent with a system prompt (you can add optional tools, too)
    const codeAgent = createAgent({
      name: "code-agent",
      system: "You are an expert Next.js Developer. You Write Readable, Maintainable Code. You Write Simple Next.js/React.js Snippets",
      model: gemini({ model: "gemini-2.0-flash" }),
    });

    // Run the agent with an input.  This automatically uses steps
    // to call your AI model.
    const { output } = await codeAgent.run(`Write the following snippet: ${event.data.value}`);

    return { output };
  },
);
