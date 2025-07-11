import {
	openai,
	createAgent,
	createTool,
	createNetwork,
} from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "e2b";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "@/prompt";
import { z } from "zod";


export const generateCode = inngest.createFunction(
	{ id: "generate-code" },
	{ event: "test/generate.code" },
	async ({ event, step }) => {
		const sandboxId = await step.run("get-sandbox-id", async () => {
			const sandbox = await Sandbox.create("vibecraft-nextjs-yousiefsameh");
			return sandbox.sandboxId;
		});

		const model = openai({
			model: "gpt-4.1",
			baseUrl: "https://models.github.ai/inference",
			apiKey: process.env.OPENAI_API_KEY,
		});

		// 4) Build your agent & network
		const codeAgent = createAgent({
			name: "code-agent",
			system: PROMPT,
			model,
			tools: [
				// terminal use
				createTool({
					name: "terminal",
					description: "Use the terminal to run commands",
					parameters: z.object({
            command: z.string(),
          }),
					handler: async ({ command }) => {
						const buffers = { stdout: "", stderr: "" };

						try {
							const sandbox = await getSandbox(sandboxId);
							const result = await sandbox.commands.run(command, {
								onStdout: (data: string) => {
									buffers.stdout += data;
								},
								onStderr: (data: string) => {
									buffers.stderr += data;
								},
							});
							return result.stdout;
						} catch (e) {
							console.error(
								`Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
							);
							return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
						}
					},
				}),
				// create or update file
				createTool({
					name: "createOrUpdateFiles",
					description: "Create or update files in the sandbox",
					parameters: z.object({
						files: z.array(
							z.object({
								path: z.string(),
								content: z.string(),
							})
						),
					}),
					handler: async ({ files }) => {
						try {
							const sandbox = await getSandbox(sandboxId);
							for (const file of files) {
								await sandbox.files.write(file.path, file.content);
							}
							return `Files created or updated: ${files
								.map((f:  { path: string }) => f.path)
								.join(", ")}`;
						} catch (e) {
							return "Error: " + e;
						}
					},
				}),
				// read files
				createTool({
					name: "readFiles",
					description: "Read files from the sandbox",
					parameters: z.object({
						files: z.array(z.string()),
					}),
					handler: async ({ files }) => {
						const sandbox = await getSandbox(sandboxId);
						const result: Array<{ path: string; content: string }> = [];
						for (const f of files) {
							const content = await sandbox.files.read(f);
							result.push({ path: f, content });
						}
						return JSON.stringify(result);
					},
				}),
			],
			lifecycle: {
				onResponse: async ({ result, network }) => {
					const txt = await lastAssistantTextMessageContent(result);
					if (txt?.includes("<task_summary>") && network) {
						network.state.data.summary = txt;
					}
					return result;
				},
			},
		});

		const network = createNetwork({
			name: "coding-agent-network",
			agents: [codeAgent],
			defaultModel: model,
			maxIter: 15,
			router: async ({ network }) =>
				network.state.data.summary ? undefined : codeAgent,
		});

		// 5) Run!
		const result = await network.run(event.data.value);
		const sandbox = await getSandbox(sandboxId);
		return {
			url: `https://${sandbox.getHost(3000)}`,
			title: "Fragment",
			files: result.state.data.files || {},
			summary: result.state.data.summary || "",
		};
	}
);
