import type { Agent, AgentEvent } from "@agent-village/shared";

const API_BASE = import.meta.env.VITE_AGENT_VILLAGE_API_URL ?? "http://127.0.0.1:4317";

export async function fetchInitialData(): Promise<{ agents: Agent[]; events: AgentEvent[] }> {
  const [agentsResponse, eventsResponse] = await Promise.all([
    fetch(`${API_BASE}/agents`),
    fetch(`${API_BASE}/events?limit=100`)
  ]);

  if (!agentsResponse.ok || !eventsResponse.ok) {
    throw new Error("Backend unavailable");
  }

  const agentsPayload = (await agentsResponse.json()) as { agents: Agent[] };
  const eventsPayload = (await eventsResponse.json()) as { events: AgentEvent[] };
  return {
    agents: agentsPayload.agents,
    events: eventsPayload.events
  };
}

export function getLiveUrl(): string {
  const url = new URL(API_BASE);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/live";
  return url.toString();
}
