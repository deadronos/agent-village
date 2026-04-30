import type { Agent } from "@agent-village/shared";
import { Bot, BrainCircuit, Code2, FlaskConical, Hammer, Landmark, ListChecks, RadioTower } from "lucide-react";
import { StatusChip } from "./StatusChip";

const iconByKind = {
  orchestrator: Landmark,
  chat: Bot,
  coding: Hammer,
  research: FlaskConical,
  memory: BrainCircuit,
  queue: ListChecks,
  tool: Code2,
  custom: RadioTower
};

export function AgentCard({
  agent,
  selected,
  onSelect,
  onHover
}: {
  agent: Agent;
  selected: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const Icon = iconByKind[agent.kind];
  return (
    <button
      className={`agent-card ${selected ? "is-selected" : ""}`}
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <span className={`agent-avatar avatar-${agent.kind}`}>
        <Icon size={24} />
      </span>
      <span className="agent-card-main">
        <span className="agent-row">
          <strong>{agent.name}</strong>
          <StatusChip status={agent.status} />
        </span>
        <span className="agent-task">{agent.currentTask ?? "Awaiting telemetry"}</span>
        <span className="progress-track">
          <span style={{ width: `${agent.progress ?? 0}%` }} />
        </span>
      </span>
      <span className="agent-progress">{Math.round(agent.progress ?? 0)}%</span>
    </button>
  );
}
