import { describe, expect, it } from "vitest";
import { createAgentRegistry } from "../src/agents/agentRegistry";
import { createInMemoryEventStore } from "../src/db/client";
import { ingestEvent } from "../src/events/ingestEvent";

describe("ingestEvent", () => {
  it("validates, stores, and upserts an agent from a new event", async () => {
    const registry = createAgentRegistry();
    const store = createInMemoryEventStore();

    const result = await ingestEvent(
      {
        agentId: "codex-001",
        source: "codex",
        type: "task_progress",
        level: "info",
        message: "Editing VillageCanvas.tsx",
        metadata: {
          name: "Code Forge",
          kind: "coding",
          buildingId: "code-forge",
          progress: 42,
          tokensPerMinute: 1280,
          latencyMs: 840,
          queueDepth: 2,
          successRate: 97.5
        }
      },
      { registry, store }
    );

    expect(result.agent).toMatchObject({
      id: "codex-001",
      name: "Code Forge",
      kind: "coding",
      status: "running",
      progress: 42,
      buildingId: "code-forge"
    });
    expect(result.event.id).toMatch(/^evt_/);
    expect(await store.listEvents()).toHaveLength(1);
    expect(registry.listAgents()).toHaveLength(1);
  });

  it("updates an existing agent and keeps recent events newest first", async () => {
    const registry = createAgentRegistry();
    const store = createInMemoryEventStore();

    await ingestEvent(
      {
        id: "evt-first",
        agentId: "codex-001",
        timestamp: "2026-04-30T12:00:00.000Z",
        source: "codex",
        type: "task_started",
        level: "info",
        message: "Started workflow",
        metadata: {
          name: "Command Center",
          kind: "orchestrator",
          status: "running",
          progress: 5
        }
      },
      { registry, store }
    );

    const result = await ingestEvent(
      {
        id: "evt-second",
        agentId: "codex-001",
        timestamp: "2026-04-30T12:01:00.000Z",
        source: "codex",
        type: "error",
        level: "error",
        message: "Tool call failed",
        metadata: {
          progress: 35,
          latencyMs: 1200
        }
      },
      { registry, store }
    );

    expect(result.agent).toMatchObject({
      id: "codex-001",
      status: "error",
      progress: 35,
      latencyMs: 1200,
      currentTask: "Tool call failed"
    });
    expect((await store.listEvents()).map((event) => event.id)).toEqual(["evt-second", "evt-first"]);
  });

  it("rejects invalid ingest payloads", async () => {
    const registry = createAgentRegistry();
    const store = createInMemoryEventStore();

    await expect(
      ingestEvent(
        {
          agentId: "",
          type: "not-real",
          level: "info",
          message: ""
        },
        { registry, store }
      )
    ).rejects.toMatchObject({
      name: "ZodError"
    });
  });
});
