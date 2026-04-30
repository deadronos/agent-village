import { z } from "zod";

export const agentStatusSchema = z.enum(["running", "idle", "waiting", "error", "offline"]);

export const agentKindSchema = z.enum([
  "orchestrator",
  "chat",
  "coding",
  "research",
  "memory",
  "queue",
  "tool",
  "custom"
]);

export const eventLevelSchema = z.enum(["info", "success", "warning", "error"]);

export const eventTypeSchema = z.enum([
  "task_started",
  "task_progress",
  "task_completed",
  "tool_call",
  "message",
  "token_usage",
  "error",
  "heartbeat"
]);

export const agentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: agentKindSchema,
  status: agentStatusSchema,
  currentTask: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  tokensPerMinute: z.number().min(0).optional(),
  latencyMs: z.number().min(0).optional(),
  queueDepth: z.number().int().min(0).optional(),
  successRate: z.number().min(0).max(100).optional(),
  source: z.string().optional(),
  lastSeenAt: z.string().datetime(),
  buildingId: z.string().optional()
});

export const eventMetadataSchema = z
  .object({
    name: z.string().optional(),
    kind: agentKindSchema.optional(),
    status: agentStatusSchema.optional(),
    currentTask: z.string().optional(),
    progress: z.number().min(0).max(100).optional(),
    tokensPerMinute: z.number().min(0).optional(),
    tokens: z.number().min(0).optional(),
    latencyMs: z.number().min(0).optional(),
    queueDepth: z.number().int().min(0).optional(),
    successRate: z.number().min(0).max(100).optional(),
    buildingId: z.string().optional(),
    source: z.string().optional()
  })
  .catchall(z.unknown());

export const agentEventSchema = z.object({
  id: z.string().min(1),
  agentId: z.string().min(1),
  timestamp: z.string().datetime(),
  level: eventLevelSchema,
  type: eventTypeSchema,
  message: z.string().min(1),
  metadata: eventMetadataSchema.optional()
});

export const ingestEventSchema = agentEventSchema.omit({ id: true, timestamp: true }).extend({
  id: z.string().min(1).optional(),
  timestamp: z.string().datetime().optional(),
  source: z.string().optional()
});

export const agentStatusList = agentStatusSchema.options;

export const buildingIdSchema = z.enum([
  "command-center",
  "chat-hall",
  "code-forge",
  "token-mine",
  "task-board",
  "memory-archive",
  "research-lab",
  "alert-tower"
]);
