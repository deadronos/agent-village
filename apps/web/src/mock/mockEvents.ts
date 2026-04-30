import type { Agent, AgentEvent, AgentStatus } from "@agent-village/shared";
import { applyAgentEvent } from "@agent-village/shared";
import { seedAgents } from "./mockAgents";

const eventMessages = [
  "Dispatched task to Code Forge",
  "Received token batch from Chat Hall",
  "Workflow step completed",
  "New request from local session",
  "Allocated memory block",
  "Queued research lookup",
  "Heartbeat received",
  "Tool call returned"
];

export function createMockTick(sequence: number, agents: Record<string, Agent>): { event: AgentEvent; agent: Agent } {
  const fallback = seedAgents[sequence % seedAgents.length]!;
  const current = agents[fallback.id] ?? fallback;
  const level = sequence % 23 === 0 ? "error" : sequence % 9 === 0 ? "warning" : sequence % 6 === 0 ? "success" : "info";
  const type =
    level === "error"
      ? "error"
      : sequence % 6 === 0
        ? "task_completed"
        : sequence % 4 === 0
          ? "tool_call"
          : sequence % 3 === 0
            ? "token_usage"
            : "task_progress";
  const status: AgentStatus =
    type === "error" ? "error" : type === "task_completed" ? "idle" : sequence % 11 === 0 ? "waiting" : "running";
  const progress = status === "idle" ? 100 : status === "error" ? current.progress ?? 0 : ((current.progress ?? 0) + 9 + sequence) % 100;
  const event: AgentEvent = {
    id: `mock-${Date.now()}-${sequence}`,
    agentId: current.id,
    timestamp: new Date().toISOString(),
    level,
    type,
    message: eventMessages[sequence % eventMessages.length]!,
    metadata: {
      status,
      currentTask: status === "idle" ? "Awaiting next assignment" : eventMessages[sequence % eventMessages.length],
      progress,
      tokensPerMinute: Math.round((current.tokensPerMinute ?? 1000) * (0.75 + ((sequence % 7) / 10))),
      latencyMs: Math.max(42, Math.round((current.latencyMs ?? 150) + ((sequence % 5) - 2) * 37)),
      queueDepth: Math.max(0, ((current.queueDepth ?? 1) + sequence) % 9),
      successRate: Math.max(72, Math.min(100, (current.successRate ?? 98) + (level === "error" ? -4 : 0.2))),
      source: "mock-local"
    }
  };

  return {
    event,
    agent: applyAgentEvent(current, event)
  };
}

export function startMockSimulation(
  getAgents: () => Record<string, Agent>,
  onTick: (payload: { event: AgentEvent; agent: Agent }) => void
): () => void {
  let sequence = 1;
  const timer = window.setInterval(() => {
    onTick(createMockTick(sequence++, getAgents()));
  }, 1500);

  return () => window.clearInterval(timer);
}
