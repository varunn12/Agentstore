export interface AgentDefinitionPillar {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export const AGENT_DEFINITION = {
  title: "What is an Agent?",
  summary:
    "An agent is someone with whom a user can talk, can use a set of tools, can do reasoning (optional), and complete a complex task.",
  intro:
    "This is the definition we use across Agent Store to decide what belongs in the catalog. It sets a clear bar: agents are interactive, capable, and goal-oriented — not just APIs or one-shot prompts.",
  pillars: [
    {
      id: "conversational",
      title: "Conversational",
      description:
        "There is a user-facing interaction surface — chat, voice, or similar — so people can talk to the agent, not just trigger a batch job or call an endpoint.",
      required: true,
    },
    {
      id: "tools",
      title: "Tool-using",
      description:
        "The agent can invoke a defined set of tools — APIs, MCP actions, integrations — to act on the world and gather information beyond its context window.",
      required: true,
    },
    {
      id: "reasoning",
      title: "Reasoning (optional)",
      description:
        "The agent may plan, reflect, or chain steps before acting. Reasoning improves quality on complex work, but it is not required for something to count as an agent.",
      required: false,
    },
    {
      id: "task-completion",
      title: "Task completion",
      description:
        "The agent is built to finish a non-trivial goal end to end — not just answer a single question. Eval suites and GTM checklists in the catalog reflect this expectation.",
      required: true,
    },
  ] satisfies AgentDefinitionPillar[],
  boundaries: [
    {
      label: "Not an agent",
      example: "A plain LLM chatbot with no tools",
      reason: "It can talk, but it cannot act on external systems.",
    },
    {
      label: "Not an agent",
      example: "A headless script that calls APIs on a schedule",
      reason: "It uses tools, but there is no conversational surface for users.",
    },
    {
      label: "Is an agent",
      example: "A replenishment assistant you chat with that runs forecasts, checks funds, and pushes orders to ERP",
      reason: "Conversational, tool-using, and completes a complex business task.",
    },
  ],
} as const;
