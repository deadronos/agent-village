import type { AgentStatus } from "@agent-village/shared";
import { statusColor, statusLabel } from "../village/pixi/effects";

const chipClass: Record<AgentStatus, string> = {
  running: "chip-running",
  idle: "chip-idle",
  waiting: "chip-waiting",
  error: "chip-error",
  offline: "chip-offline"
};

export function StatusChip({
  status,
  count,
  active,
  onClick
}: {
  status: AgentStatus;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="status-dot" style={{ backgroundColor: `#${statusColor[status].toString(16).padStart(6, "0")}` }} />
      <span>{typeof count === "number" ? `${count} ` : ""}{statusLabel[status]}</span>
    </>
  );

  if (!onClick) {
    return (
      <span className={`status-chip ${chipClass[status]} ${active ? "is-active" : ""}`} title={statusLabel[status]}>
        {content}
      </span>
    );
  }

  return (
    <button
      className={`status-chip ${chipClass[status]} ${active ? "is-active" : ""}`}
      onClick={onClick}
      type="button"
      title={`Filter ${statusLabel[status]} agents`}
    >
      {content}
    </button>
  );
}
