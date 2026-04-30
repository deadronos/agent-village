import { describe, expect, it } from "vitest";
import {
  applyAgentEvent,
  deriveAgentCounts,
  deriveBuildingVisualStates,
  filterAgents,
  type Agent,
  type AgentEvent
} from "../src/index";

const baseAgents: Agent[] = [
  {
    id: "ag-command",
    name: "Command Center",
    kind: "orchestrator",
    status: "running",
    currentTask: "Orchestrating workflow",
    progress: 78,
    tokensPerMinute: 12400,
    latencyMs: 128,
    queueDepth: 3,
    successRate: 98.7,
    source: "mock",
    lastSeenAt: "2026-04-30T12:00:00.000Z",
    buildingId: "command-center"
  },
  {
    id: "ag-token",
    name: "Token Mine",
    kind: "tool",
    status: "idle",
    currentTask: "Awaiting requests",
    progress: 0,
    tokensPerMinute: 320,
    latencyMs: 72,
    queueDepth: 0,
    successRate: 100,
    source: "mock",
    lastSeenAt: "2026-04-30T12:00:02.000Z",
    buildingId: "token-mine"
  },
  {
    id: "ag-forge",
    name: "Code Forge",
    kind: "coding",
    status: "error",
    currentTask: "Failed patch validation",
    progress: 42,
    tokensPerMinute: 8800,
    latencyMs: 410,
    queueDepth: 1,
    successRate: 83.2,
    source: "mock",
    lastSeenAt: "2026-04-30T12:00:04.000Z",
    buildingId: "code-forge"
  }
];

describe("deriveAgentCounts", () => {
  it("counts agents by status and includes total", () => {
    expect(deriveAgentCounts(baseAgents)).toEqual({
      total: 3,
      running: 1,
      idle: 1,
      waiting: 0,
      error: 1,
      offline: 0
    });
  });
});

describe("filterAgents", () => {
  it("filters by status and case-insensitive text across task, source, and name", () => {
    expect(filterAgents(baseAgents, { status: "running", query: "workflow" })).toHaveLength(1);
    expect(filterAgents(baseAgents, { query: "TOKEN" }).map((agent) => agent.id)).toEqual(["ag-token"]);
    expect(filterAgents(baseAgents, { query: "patch" }).map((agent) => agent.id)).toEqual(["ag-forge"]);
    expect(filterAgents(baseAgents, { query: "mock" })).toHaveLength(3);
  });
});

describe("deriveBuildingVisualStates", () => {
  it("rolls agents up to building activity with error taking priority", () => {
    const states = deriveBuildingVisualStates(baseAgents);
    const forge = states.find((state) => state.buildingId === "code-forge");

    expect(forge).toMatchObject({
      buildingId: "code-forge",
      status: "error",
      errorCount: 1,
      agentCount: 1
    });
    expect(forge?.activityLevel).toBeGreaterThan(0.4);
  });

  it("uses the configured kind-to-building fallback when buildingId is absent", () => {
    const [agent] = baseAgents;
    const { buildingId: _buildingId, ...agentWithoutBuilding } = agent!;
    const states = deriveBuildingVisualStates([agentWithoutBuilding]);

    expect(states[0]?.buildingId).toBe("command-center");
  });
});

describe("applyAgentEvent", () => {
  it("updates status, progress, metrics, and last seen from event metadata", () => {
    const event: AgentEvent = {
      id: "evt-1",
      agentId: "ag-token",
      timestamp: "2026-04-30T12:01:00.000Z",
      level: "warning",
      type: "task_progress",
      message: "Token queue is backing up",
      metadata: {
        status: "waiting",
        progress: 31,
        tokensPerMinute: 9100,
        latencyMs: 310,
        queueDepth: 9,
        successRate: 96.1,
        currentTask: "Processing queued usage events"
      }
    };

    const updated = applyAgentEvent(baseAgents[1]!, event);

    expect(updated).toMatchObject({
      status: "waiting",
      progress: 31,
      tokensPerMinute: 9100,
      latencyMs: 310,
      queueDepth: 9,
      successRate: 96.1,
      currentTask: "Processing queued usage events",
      lastSeenAt: event.timestamp
    });
  });

  it("turns error events into error status even without metadata", () => {
    const event: AgentEvent = {
      id: "evt-2",
      agentId: "ag-command",
      timestamp: "2026-04-30T12:02:00.000Z",
      level: "error",
      type: "error",
      message: "Adapter failed"
    };

    expect(applyAgentEvent(baseAgents[0]!, event).status).toBe("error");
  });
});
