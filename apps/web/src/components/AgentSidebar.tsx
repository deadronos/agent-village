import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import {
  selectFilteredAgents,
  useDashboardStore
} from "../stores/dashboardStore";
import { AgentCard } from "./AgentCard";

export function AgentSidebar() {
  const agents = useDashboardStore(useShallow(selectFilteredAgents));
  const allCount = useDashboardStore((state) => Object.keys(state.agents).length);
  const selectedAgentId = useDashboardStore((state) => state.selectedAgentId);
  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const selectAgent = useDashboardStore((state) => state.selectAgent);
  const setSearchQuery = useDashboardStore((state) => state.setSearchQuery);
  const hoverBuilding = useDashboardStore((state) => state.hoverBuilding);

  return (
    <aside className="sidebar panel">
      <div className="panel-header">
        <h2>Agents</h2>
        <span className="count-pill">{allCount}</span>
      </div>
      <div className="search-row">
        <Search size={16} />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search agents..."
          aria-label="Search agents"
        />
        <button className="square-button" type="button" title="Sort and filters">
          <SlidersHorizontal size={16} />
        </button>
      </div>
      <div className="agent-list">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            selected={selectedAgentId === agent.id}
            onSelect={() => selectAgent(agent.id)}
            onHover={(hovered) => hoverBuilding(hovered ? agent.buildingId : undefined)}
          />
        ))}
      </div>
      <button className="add-agent-button" type="button">
        <Plus size={16} /> Add New Agent
      </button>
    </aside>
  );
}
