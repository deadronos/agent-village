import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import type { AgentRegistry } from "../agents/agentRegistry";
import type { EventStore } from "../db/client";
import type { Broadcaster } from "../live/broadcaster";
import { ingestEvent } from "./ingestEvent";

export type EventRouterDependencies = {
  registry: AgentRegistry;
  store: EventStore;
  broadcaster: Broadcaster;
  startedAt: number;
};

export async function registerEventRoutes(app: FastifyInstance, dependencies: EventRouterDependencies): Promise<void> {
  app.get("/health", async () => ({
    ok: true,
    uptimeMs: Date.now() - dependencies.startedAt,
    clients: dependencies.broadcaster.clientCount()
  }));

  app.get("/agents", async () => ({
    agents: dependencies.registry.listAgents(),
    counts: dependencies.registry.getCounts()
  }));

  app.get<{ Querystring: { agentId?: string; limit?: string } }>("/events", async (request) => ({
    events: await dependencies.store.listEvents({
      ...(request.query.agentId ? { agentId: request.query.agentId } : {}),
      limit: request.query.limit ? Number(request.query.limit) : 100
    })
  }));

  app.post("/events", async (request, reply) => {
    try {
      const result = await ingestEvent(request.body, dependencies);
      dependencies.broadcaster.broadcast({
        type: "event",
        event: result.event,
        agent: result.agent
      });
      return reply.code(202).send(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.code(400).send({
          error: "invalid_event",
          issues: error.issues
        });
      }
      throw error;
    }
  });
}
