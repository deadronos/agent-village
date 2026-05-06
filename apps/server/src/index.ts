import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import Fastify from "fastify";
import { createAgentRegistry } from "./agents/agentRegistry";
import { createMockIngestEvent } from "./adapters/mockAdapter";
import { createSqliteEventStore, type EventStore } from "./db/client";
import { registerEventRoutes } from "./events/eventRouter";
import { ingestEvent } from "./events/ingestEvent";
import { createBroadcaster } from "./live/broadcaster";

export async function buildServer(options: { store?: EventStore; enableMockAdapter?: boolean } = {}) {
  const app = Fastify({ logger: true });
  const startedAt = Date.now();
  const registry = createAgentRegistry();
  const store = options.store ?? (await createSqliteEventStore());
  const broadcaster = createBroadcaster(async () => ({
    agents: registry.listAgents(),
    events: await store.listEvents({ limit: 100 }),
    timestamp: new Date().toISOString()
  }));

  await app.register(cors, { origin: true });
  await app.register(websocket);

  app.get("/live", { websocket: true }, (socket) => {
    const client = {
      send(payload: string) {
        socket.send(payload);
      }
    };
    broadcaster.addClient(client);
    socket.on("close", () => broadcaster.removeClient(client));
  });

  await registerEventRoutes(app, {
    registry,
    store,
    broadcaster,
    startedAt
  });

  app.get("/uptime", async () => ({
    startedAt
  }));

  if (options.enableMockAdapter ?? process.env.AGENT_VILLAGE_MOCK_ADAPTER !== "0") {
    let sequence = 0;
    const timer = setInterval(() => {
      void ingestEvent(createMockIngestEvent(sequence++), { registry, store }).then((result) => {
        broadcaster.broadcast({ type: "event", event: result.event, agent: result.agent });
      });
    }, 1600);
    app.addHook("onClose", async () => clearInterval(timer));
  }

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 4317);
  const host = process.env.HOST ?? "127.0.0.1";
  const app = await buildServer();
  await app.listen({ port, host });
}
