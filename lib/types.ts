export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
};

export type AgentKitModel = {
  name: string;
  format: "chat";
  options?: Record<string, unknown>;
  call: (args: { messages: ChatMessage[] }) => Promise<string>;
};
