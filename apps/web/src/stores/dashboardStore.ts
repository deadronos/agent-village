import type { Agent, AgentEvent, AgentStatus, BuildingVisualState, LiveMessage } from "@agent-village/shared";
import { deriveAgentCounts, deriveBuildingVisualStates, filterAgents } from "@agent-village/shared";
import { create } from "zustand";

export type ConnectionState = "connected" | "connecting" | "offline" | "mock";

type LiveEventPayload = Extract<LiveMessage, { type: "event" }>;

type DashboardStore = {
  agents: Record<string, Agent>;
  events: AgentEvent[];
  selectedAgentId: string | undefined;
  selectedBuildingId: string | undefined;
  hoveredBuildingId: string | undefined;
  statusFilter: AgentStatus | undefined;
  searchQuery: string;
  connectionState: ConnectionState;
  reset(agents: Agent[]): void;
  setSnapshot(payload: { agents: Agent[]; events: AgentEvent[] }): void;
  ingestLiveEvent(payload: LiveEventPayload): void;
  selectAgent(agentId?: string): void;
  selectBuilding(buildingId?: string): void;
  hoverBuilding(buildingId?: string): void;
  setStatusFilter(status?: AgentStatus): void;
  setSearchQuery(query: string): void;
  setConnectionState(state: ConnectionState): void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  agents: {},
  events: [],
  selectedAgentId: undefined,
  selectedBuildingId: undefined,
  hoveredBuildingId: undefined,
  statusFilter: undefined,
  searchQuery: "",
  connectionState: "connecting",
  reset(agents) {
    set({
      agents: Object.fromEntries(agents.map((agent) => [agent.id, agent])),
      events: [],
      selectedAgentId: agents[0]?.id,
      selectedBuildingId: agents[0]?.buildingId,
      hoveredBuildingId: undefined,
      statusFilter: undefined,
      searchQuery: "",
      connectionState: "mock"
    });
  },
  setSnapshot(payload) {
    set({
      agents: Object.fromEntries(payload.agents.map((agent) => [agent.id, agent])),
      events: payload.events.slice(0, 120)
    });
  },
  ingestLiveEvent(payload) {
    set((state) => ({
      agents: {
        ...state.agents,
        [payload.agent.id]: payload.agent
      },
      events: [payload.event, ...state.events.filter((event) => event.id !== payload.event.id)].slice(0, 120)
    }));
  },
  selectAgent(agentId) {
    set((state) => ({
      selectedAgentId: agentId,
      selectedBuildingId: agentId ? state.agents[agentId]?.buildingId : state.selectedBuildingId
    }));
  },
  selectBuilding(buildingId) {
    set({
      selectedBuildingId: buildingId,
      selectedAgentId: undefined
    });
  },
  hoverBuilding(buildingId) {
    set({ hoveredBuildingId: buildingId });
  },
  setStatusFilter(status) {
    set((state) => ({
      statusFilter: state.statusFilter === status ? undefined : status
    }));
  },
  setSearchQuery(query) {
    set({ searchQuery: query });
  },
  setConnectionState(connectionState) {
    set({ connectionState });
  }
}));

export function selectAgentArray(state: Pick<DashboardStore, "agents">): Agent[] {
  return Object.values(state.agents).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
}

export function selectFilteredAgents(state: DashboardStore): Agent[] {
  return filterAgents(selectAgentArray(state), {
    ...(state.statusFilter ? { status: state.statusFilter } : {}),
    query: state.searchQuery
  });
}

export function selectAgentCounts(state: DashboardStore) {
  return deriveAgentCounts(selectAgentArray(state));
}

export function selectBuildingStates(state: DashboardStore): BuildingVisualState[] {
  return deriveBuildingVisualStates(selectAgentArray(state));
}
