import { beforeEach, describe, expect, it } from "vitest";
import { useDashboardStore } from "../src/stores/dashboardStore";
import { seedAgents } from "../src/mock/mockAgents";

describe("dashboardStore", () => {
  beforeEach(() => {
    useDashboardStore.getState().reset(seedAgents);
  });

  it("selects agents, filters by status, and stores recent events newest first", () => {
    const store = useDashboardStore.getState();

    store.setStatusFilter("running");
    store.selectAgent("ag-command");
    store.ingestLiveEvent({
      event: {
        id: "evt-new",
        agentId: "ag-command",
        timestamp: "2026-04-30T12:10:00.000Z",
        level: "error",
        type: "error",
        message: "Workflow blocked"
      },
      agent: {
        ...seedAgents[0]!,
        status: "error",
        currentTask: "Workflow blocked",
        lastSeenAt: "2026-04-30T12:10:00.000Z"
      }
    });

    const next = useDashboardStore.getState();
    expect(next.selectedAgentId).toBe("ag-command");
    expect(next.statusFilter).toBe("running");
    expect(next.events[0]?.id).toBe("evt-new");
    expect(next.agents["ag-command"]?.status).toBe("error");
  });
});
