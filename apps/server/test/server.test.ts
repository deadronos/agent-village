import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { buildServer } from "../src/index";
import { createAgentRegistry } from "../src/agents/agentRegistry";
import { createInMemoryEventStore } from "../src/db/client";

describe("full event lifecycle", () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  beforeEach(async () => {
    app = await buildServer({
      enableMockAdapter: false,
      store: createInMemoryEventStore()
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("POST /events validates, persists, and returns an agent event", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/events",
      payload: {
        agentId: "codex-001",
        type: "task_progress",
        level: "info",
        message: "Building component tree",
        metadata: {
          name: "Code Forge",
          kind: "coding",
          status: "running",
          progress: 42,
          tokensPerMinute: 4200
        }
      }
    });

    expect(response.statusCode).toBe(202);
    const result = JSON.parse(response.body) as { agent: { id: string; name: string; status: string }; event: { id: string } };
    expect(result.agent.id).toBe("codex-001");
    expect(result.agent.name).toBe("Code Forge");
    expect(result.agent.status).toBe("running");
    expect(result.event.id).toMatch(/^evt_/);
  });

  it("GET /health returns ok status with uptime and client count", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body) as { ok: boolean; uptimeMs: number; clients: number };
    expect(body.ok).toBe(true);
    expect(typeof body.uptimeMs).toBe("number");
    expect(body.clients).toBe(0);
  });

  it("GET /agents reflects registry state after events are posted", async () => {
    await app.inject({
      method: "POST",
      url: "/events",
      payload: { agentId: "ag-001", type: "task_started", level: "info", message: "Startup" }
    });

    const response = await app.inject({ method: "GET", url: "/agents" });
    const body = JSON.parse(response.body) as { agents: unknown[]; counts: { total: number } };
    expect(body.agents).toHaveLength(1);
    expect(body.counts.total).toBe(1);
  });

  it("GET /events returns events newest-first", async () => {
    await app.inject({
      method: "POST",
      url: "/events",
      payload: { id: "evt-1", agentId: "ag-001", timestamp: "2026-04-30T12:00:00.000Z", type: "task_started", level: "info", message: "First" }
    });
    await app.inject({
      method: "POST",
      url: "/events",
      payload: { id: "evt-2", agentId: "ag-001", timestamp: "2026-04-30T12:01:00.000Z", type: "task_progress", level: "info", message: "Second" }
    });

    const response = await app.inject({ method: "GET", url: "/events" });
    const body = JSON.parse(response.body) as { events: { id: string }[] };
    expect(body.events.map((e) => e.id)).toEqual(["evt-2", "evt-1"]);
  });

  it("GET /events?agentId= filters to that agent only", async () => {
    await app.inject({
      method: "POST",
      url: "/events",
      payload: { id: "evt-a", agentId: "ag-alpha", type: "task_started", level: "info", message: "Alpha" }
    });
    await app.inject({
      method: "POST",
      url: "/events",
      payload: { id: "evt-b", agentId: "ag-beta", type: "task_started", level: "info", message: "Beta" }
    });

    const response = await app.inject({ method: "GET", url: "/events?agentId=ag-alpha" });
    const body = JSON.parse(response.body) as { events: { agentId: string }[] };
    expect(body.events).toHaveLength(1);
    expect(body.events[0]?.agentId).toBe("ag-alpha");
  });

  it("GET /events?limit=N caps results", async () => {
    for (let i = 0; i < 5; i++) {
      await app.inject({
        method: "POST",
        url: "/events",
        payload: { agentId: "ag-limit", type: "task_started", level: "info", message: `Event ${i}` }
      });
    }

    const response = await app.inject({ method: "GET", url: "/events?limit=3" });
    const body = JSON.parse(response.body) as { events: unknown[] };
    expect(body.events).toHaveLength(3);
  });

  it("POST /events rejects invalid payloads with 400 and Zod issues", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/events",
      payload: { agentId: "", type: "invalid", level: "info", message: "" }
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body) as { error: string; issues: unknown[] };
    expect(body.error).toBe("invalid_event");
    expect(Array.isArray(body.issues)).toBe(true);
    expect(body.issues.length).toBeGreaterThan(0);
  });

  it("GET /uptime returns server start timestamp", async () => {
    const response = await app.inject({ method: "GET", url: "/uptime" });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body) as { startedAt: number };
    expect(typeof body.startedAt).toBe("number");
    expect(body.startedAt).toBeGreaterThan(0);
  });

  it("second event for same agentId updates status and progress", async () => {
    await app.inject({
      method: "POST",
      url: "/events",
      payload: { agentId: "ag-same", type: "task_started", level: "info", message: "Started", metadata: { status: "running", progress: 10 } }
    });
    const response = await app.inject({
      method: "POST",
      url: "/events",
      payload: { agentId: "ag-same", type: "task_progress", level: "info", message: "Continuing", metadata: { progress: 60, status: "running" } }
    });

    const body = JSON.parse(response.body) as { agent: { status: string; progress: number } };
    expect(body.agent.status).toBe("running");
    expect(body.agent.progress).toBe(60);
  });
});