import type { Agent, AgentEvent } from "@agent-village/shared";

export const API_BASE = import.meta.env.VITE_AGENT_VILLAGE_API_URL ?? "http://127.0.0.1:4317";

const FETCH_TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchInitialData(): Promise<{ agents: Agent[]; events: AgentEvent[] }> {
  const [agentsResponse, eventsResponse] = await Promise.all([
    fetchWithTimeout(`${API_BASE}/agents`, FETCH_TIMEOUT_MS),
    fetchWithTimeout(`${API_BASE}/events?limit=100`, FETCH_TIMEOUT_MS)
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

export async function fetchUptime(): Promise<{ startedAt: number }> {
  const response = await fetchWithTimeout(`${API_BASE}/uptime`, FETCH_TIMEOUT_MS);
  if (!response.ok) throw new Error("Backend unavailable");
  return response.json() as Promise<{ startedAt: number }>;
}

export function getLiveUrl(): string {
  const url = new URL(API_BASE);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/live";
  return url.toString();
}
