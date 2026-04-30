import { randomUUID } from "node:crypto";
import { agentEventSchema, ingestEventSchema, type Agent, type AgentEvent, type IngestEvent } from "@agent-village/shared";
import type { AgentRegistry } from "../agents/agentRegistry";
import type { EventStore } from "../db/client";

export type IngestDependencies = {
  registry: AgentRegistry;
  store: EventStore;
};

export type IngestResult = {
  event: AgentEvent;
  agent: Agent;
};

export async function ingestEvent(input: unknown, dependencies: IngestDependencies): Promise<IngestResult> {
  const parsed = ingestEventSchema.parse(input) as IngestEvent & { source?: string };
  const metadata = {
    ...(parsed.metadata ?? {}),
    ...(parsed.source ? { source: parsed.source } : {})
  };
  const event = agentEventSchema.parse({
    id: parsed.id ?? `evt_${randomUUID()}`,
    agentId: parsed.agentId,
    timestamp: parsed.timestamp ?? new Date().toISOString(),
    level: parsed.level,
    type: parsed.type,
    message: parsed.message,
    ...(Object.keys(metadata).length > 0 ? { metadata } : {})
  });

  await dependencies.store.insertEvent(event);
  const agent = dependencies.registry.upsertFromEvent(event);

  return { event, agent };
}
