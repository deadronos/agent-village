import { Expand, Home, Settings } from "lucide-react";
import type { AgentCounts, AgentStatus } from "@agent-village/shared";
import { StatusChip } from "./StatusChip";

const statuses: AgentStatus[] = ["running", "idle", "waiting", "error"];

export function TopBar({
  counts,
  uptime,
  activeStatus,
  onStatusClick
}: {
  counts: AgentCounts;
  uptime: string;
  activeStatus: AgentStatus | undefined;
  onStatusClick: (status: AgentStatus) => void;
}) {
  return (
    <header className="topbar">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">
          <span />
        </div>
        <div>
          <h1>Agent Village</h1>
          <p>AI Agent Dashboard <kbd>v0.1.0</kbd></p>
        </div>
      </div>
      <div className="topbar-divider" />
      <div className="uptime">
        <span>Uptime</span>
        <strong>{uptime}</strong>
      </div>
      <div className="topbar-chips">
        {statuses.map((status) => (
          <StatusChip
            key={status}
            status={status}
            count={counts[status]}
            active={activeStatus === status}
            onClick={() => onStatusClick(status)}
          />
        ))}
      </div>
      <nav className="topbar-actions" aria-label="Dashboard views">
        <button className="view-button is-active" type="button">
          <Home size={16} /> Overview
        </button>
        <button className="view-button" type="button">
          <Expand size={16} /> Expand
        </button>
        <button className="icon-button" type="button" title="Settings">
          <Settings size={18} />
        </button>
      </nav>
    </header>
  );
}
