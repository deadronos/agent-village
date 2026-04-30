import type { AgentStatus } from "@agent-village/shared";

export const statusColor: Record<AgentStatus, number> = {
  running: 0x2bdd68,
  idle: 0x4da3ff,
  waiting: 0xf4bd38,
  error: 0xff5a68,
  offline: 0x7f8a96
};

export const statusLabel: Record<AgentStatus, string> = {
  running: "Running",
  idle: "Idle",
  waiting: "Waiting",
  error: "Error",
  offline: "Offline"
};
