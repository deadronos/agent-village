import { useMemo } from "react";
import { Copy, Eye, Radio, ShieldAlert } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { deriveBuildingVisualStates } from "@agent-village/shared";
import { buildingById } from "../village/data/buildingDefinitions";
import {
  useDashboardStore
} from "../stores/dashboardStore";
import { StatusChip } from "./StatusChip";

export function SelectedAgentPanel() {
  const agentsById = useDashboardStore((state) => state.agents);
  const agents = useMemoAgentArray(agentsById);
  const events = useDashboardStore((state) => state.events);
  const selectedAgentId = useDashboardStore((state) => state.selectedAgentId);
  const selectedBuildingId = useDashboardStore((state) => state.selectedBuildingId);
  const buildingStates = useMemoBuildingStates(agents);
  const selectedAgent = selectedAgentId ? agents.find((agent) => agent.id === selectedAgentId) : undefined;
  const buildingState = buildingStates.find((state) => state.buildingId === selectedBuildingId);
  const building = selectedBuildingId ? buildingById[selectedBuildingId] : undefined;
  const agent = selectedAgent ?? buildingState?.agents[0] ?? agents[0];
  const relevantEvents = events.filter((event) => !agent || event.agentId === agent.id).slice(0, 5);

  return (
    <aside className="inspector panel">
      <div className="panel-header">
        <h2>{selectedAgent ? "Selected Agent" : "Selected Building"}</h2>
        <Eye size={16} />
      </div>
      {agent ? (
        <>
          <section className="selected-card">
            <span className="selected-avatar">
              <Radio size={28} />
            </span>
            <span>
              <strong>{selectedAgent ? agent.name : building?.name ?? agent.name}</strong>
              <small>Agent ID: {agent.id}</small>
            </span>
            <StatusChip status={buildingState?.status ?? agent.status} />
          </section>

          <section className="detail-section">
            <h3>Current Task</h3>
            <p>{agent.currentTask ?? building?.description ?? "No active task"}</p>
            <p className="step-line">Step {Math.max(1, Math.round((agent.progress ?? 0) / 18))} of 6 · {agent.source ?? "local mock"}</p>
            <span className="progress-track is-large">
              <span style={{ width: `${agent.progress ?? 0}%` }} />
            </span>
          </section>

          <section className="detail-section">
            <div className="section-title-row">
              <h3>Recent Events</h3>
              <button type="button">View all</button>
            </div>
            <div className="event-list">
              {relevantEvents.length > 0 ? (
                relevantEvents.map((event) => (
                  <div className={`event-row event-${event.level}`} key={event.id}>
                    <span />
                    <time>{new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}</time>
                    <p>{event.message}</p>
                  </div>
                ))
              ) : (
                <div className="empty-events">
                  <ShieldAlert size={16} /> Waiting for live events
                </div>
              )}
            </div>
          </section>

          <section className="metrics-grid">
            <Metric label="Tokens / min" value={compact(agent.tokensPerMinute ?? 0)} spark="token" />
            <Metric label="Latency" value={`${Math.round(agent.latencyMs ?? 0)}ms`} spark="latency" />
            <Metric label="Queue depth" value={`${agent.queueDepth ?? 0}`} spark="queue" />
            <Metric label="Success rate" value={`${(agent.successRate ?? 100).toFixed(1)}%`} spark="success" />
          </section>

          <section className="last-action">
            <h3>Last Action</h3>
            <p>{events[0]?.message ?? "No events received yet"}</p>
            <button type="button" title="Copy agent id">
              <Copy size={15} /> Copy ID
            </button>
          </section>
        </>
      ) : null}
      <MiniMap selectedBuildingId={selectedBuildingId} />
    </aside>
  );
}

function Metric({ label, value, spark }: { label: string; value: string; spark: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <i className={`sparkline spark-${spark}`} />
    </div>
  );
}

function MiniMap({ selectedBuildingId }: { selectedBuildingId: string | undefined }) {
  const agentsById = useDashboardStore((state) => state.agents);
  const agents = useMemoAgentArray(agentsById);
  const buildingStates = useMemoBuildingStates(agents);
  return (
    <section className="minimap-grid">
      <div className="mini-map">
        {buildingStates.map((state, index) => (
          <span
            key={state.buildingId}
            className={`mini-dot dot-${state.status} ${selectedBuildingId === state.buildingId ? "is-selected" : ""}`}
            style={{
              left: `${18 + ((index * 29) % 64)}%`,
              top: `${22 + ((index * 23) % 55)}%`
            }}
          />
        ))}
      </div>
      <div className="legend">
        {["running", "idle", "waiting", "error", "offline"].map((status) => (
          <span key={status}>
            <i className={`legend-dot dot-${status}`} />
            {status}
          </span>
        ))}
      </div>
    </section>
  );
}

function useMemoAgentArray(agentsById: ReturnType<typeof useDashboardStore.getState>["agents"]) {
  return useMemo(
    () => Object.values(agentsById).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt)),
    [agentsById]
  );
}

function useMemoBuildingStates(agents: ReturnType<typeof useMemoAgentArray>) {
  return useMemo(() => deriveBuildingVisualStates(agents), [agents]);
}

function compact(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(Math.round(value));
}
