import type { z } from "zod";
import type {
  agentEventSchema,
  agentKindSchema,
  agentSchema,
  agentStatusSchema,
  eventLevelSchema,
  eventTypeSchema,
  ingestEventSchema
} from "./schemas";

export type AgentStatus = z.infer<typeof agentStatusSchema>;
export type AgentKind = z.infer<typeof agentKindSchema>;
export type EventLevel = z.infer<typeof eventLevelSchema>;
export type EventType = z.infer<typeof eventTypeSchema>;
export type Agent = z.infer<typeof agentSchema>;
export type AgentEvent = z.infer<typeof agentEventSchema>;
export type IngestEvent = z.infer<typeof ingestEventSchema>;

export type AgentCounts = Record<AgentStatus, number> & {
  total: number;
};

export type BuildingDefinition = {
  id: string;
  name: string;
  kind: AgentKind | "system";
  description: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  roofColor: string;
};

export type BuildingVisualState = {
  buildingId: string;
  status: AgentStatus;
  activityLevel: number;
  errorCount: number;
  agentCount: number;
  progress: number;
  agents: Agent[];
};

export type DashboardSnapshot = {
  agents: Agent[];
  events: AgentEvent[];
  timestamp: string;
};

export type LiveMessage =
  | {
      type: "snapshot";
      snapshot: DashboardSnapshot;
    }
  | {
      type: "event";
      event: AgentEvent;
      agent: Agent;
    };
