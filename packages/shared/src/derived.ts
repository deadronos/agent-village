import { agentStatusList } from "./schemas";
import type { Agent, AgentCounts, AgentEvent, AgentKind, AgentStatus, BuildingVisualState } from "./types";

const statusPriority: Record<AgentStatus, number> = {
  error: 5,
  waiting: 4,
  running: 3,
  idle: 2,
  offline: 1
};

export const defaultBuildingByKind: Record<AgentKind, string> = {
  orchestrator: "command-center",
  chat: "chat-hall",
  coding: "code-forge",
  research: "research-lab",
  memory: "memory-archive",
  queue: "task-board",
  tool: "token-mine",
  custom: "command-center"
};

export function resolveAgentBuildingId(agent: Pick<Agent, "buildingId" | "kind">): string {
  return agent.buildingId || defaultBuildingByKind[agent.kind];
}

export function deriveAgentCounts(agents: Agent[]): AgentCounts {
  const counts = Object.fromEntries(agentStatusList.map((status) => [status, 0])) as AgentCounts;
  counts.total = agents.length;

  for (const agent of agents) {
    counts[agent.status] += 1;
  }

  return counts;
}

export function filterAgents(
  agents: Agent[],
  filters: {
    status?: AgentStatus;
    query?: string;
    buildingId?: string;
  }
): Agent[] {
  const query = filters.query?.trim().toLowerCase();

  return agents.filter((agent) => {
    if (filters.status && agent.status !== filters.status) {
      return false;
    }

    if (filters.buildingId && resolveAgentBuildingId(agent) !== filters.buildingId) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      agent.name,
      agent.currentTask,
      agent.source,
      agent.kind,
      agent.status,
      resolveAgentBuildingId(agent)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function deriveBuildingVisualStates(agents: Agent[]): BuildingVisualState[] {
  const byBuilding = new Map<string, Agent[]>();

  for (const agent of agents) {
    const buildingId = resolveAgentBuildingId(agent);
    byBuilding.set(buildingId, [...(byBuilding.get(buildingId) ?? []), agent]);
  }

  return [...byBuilding.entries()].map(([buildingId, buildingAgents]) => {
    const status = buildingAgents
      .map((agent) => agent.status)
      .sort((a, b) => statusPriority[b] - statusPriority[a])[0] ?? "offline";
    const errorCount = buildingAgents.filter((agent) => agent.status === "error").length;
    const averageProgress =
      buildingAgents.reduce((total, agent) => total + (agent.progress ?? 0), 0) / Math.max(buildingAgents.length, 1);
    const activityLevel = Math.min(
      1,
      buildingAgents.reduce((total, agent) => {
        const tokenScore = Math.min((agent.tokensPerMinute ?? 0) / 12000, 1);
        const progressScore = (agent.progress ?? 0) / 100;
        const statusScore = agent.status === "running" ? 0.55 : agent.status === "waiting" ? 0.35 : agent.status === "error" ? 0.8 : 0.12;
        return total + Math.max(tokenScore, progressScore, statusScore);
      }, 0) / Math.max(buildingAgents.length, 1)
    );

    return {
      buildingId,
      status,
      activityLevel,
      errorCount,
      agentCount: buildingAgents.length,
      progress: Math.round(averageProgress),
      agents: buildingAgents
    };
  });
}

export function applyAgentEvent(agent: Agent, event: AgentEvent): Agent {
  const metadata = event.metadata ?? {};
  const statusFromEvent: AgentStatus =
    metadata.status ??
    (event.type === "error" || event.level === "error"
      ? "error"
      : event.type === "task_completed"
        ? "idle"
        : event.type === "heartbeat"
          ? agent.status
          : "running");

  return {
    ...agent,
    name: metadata.name ?? agent.name,
    kind: metadata.kind ?? agent.kind,
    status: statusFromEvent,
    currentTask: metadata.currentTask ?? event.message ?? agent.currentTask,
    progress: metadata.progress ?? (event.type === "task_completed" ? 100 : agent.progress),
    tokensPerMinute: metadata.tokensPerMinute ?? metadata.tokens ?? agent.tokensPerMinute,
    latencyMs: metadata.latencyMs ?? agent.latencyMs,
    queueDepth: metadata.queueDepth ?? agent.queueDepth,
    successRate: metadata.successRate ?? agent.successRate,
    source: metadata.source ?? agent.source,
    lastSeenAt: event.timestamp,
    buildingId: metadata.buildingId ?? agent.buildingId
  };
}

export function createAgentFromEvent(event: AgentEvent): Agent {
  const metadata = event.metadata ?? {};
  const kind = metadata.kind ?? "custom";

  return {
    id: event.agentId,
    name: metadata.name ?? event.agentId,
    kind,
    status: metadata.status ?? (event.type === "error" || event.level === "error" ? "error" : "running"),
    currentTask: metadata.currentTask ?? event.message,
    progress: metadata.progress ?? 0,
    tokensPerMinute: metadata.tokensPerMinute ?? metadata.tokens ?? 0,
    latencyMs: metadata.latencyMs ?? 0,
    queueDepth: metadata.queueDepth ?? 0,
    successRate: metadata.successRate ?? 100,
    source: metadata.source,
    lastSeenAt: event.timestamp,
    buildingId: metadata.buildingId ?? defaultBuildingByKind[kind]
  };
}
