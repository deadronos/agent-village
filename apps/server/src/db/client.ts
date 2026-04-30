import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { AgentEvent } from "@agent-village/shared";

export type EventStore = {
  insertEvent(event: AgentEvent): Promise<void>;
  listEvents(filters?: { agentId?: string; limit?: number }): Promise<AgentEvent[]>;
  close?: () => void;
};

export function createInMemoryEventStore(seedEvents: AgentEvent[] = []): EventStore {
  const events = [...seedEvents];

  return {
    async insertEvent(event) {
      events.push(event);
    },
    async listEvents(filters = {}) {
      return events
        .filter((event) => !filters.agentId || event.agentId === filters.agentId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, filters.limit ?? 100);
    }
  };
}

export async function createSqliteEventStore(dbPath = process.env.AGENT_VILLAGE_DB_PATH ?? ".data/agent-village.sqlite"): Promise<EventStore> {
  const fullPath = resolve(dbPath);
  await mkdir(dirname(fullPath), { recursive: true });

  const sqlite = await import("node:sqlite");
  const DatabaseSync = (sqlite as unknown as { DatabaseSync: new (path: string) => DatabaseLike }).DatabaseSync;
  const db = new DatabaseSync(fullPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      level TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_events_agent_id_timestamp ON events(agent_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
  `);

  return {
    async insertEvent(event) {
      db.prepare(
        `INSERT OR REPLACE INTO events (id, agent_id, timestamp, level, type, message, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        event.id,
        event.agentId,
        event.timestamp,
        event.level,
        event.type,
        event.message,
        event.metadata ? JSON.stringify(event.metadata) : null
      );
    },
    async listEvents(filters = {}) {
      const limit = filters.limit ?? 100;
      const rows = filters.agentId
        ? db
            .prepare(
              `SELECT id, agent_id, timestamp, level, type, message, metadata
               FROM events
               WHERE agent_id = ?
               ORDER BY timestamp DESC
               LIMIT ?`
            )
            .all(filters.agentId, limit)
        : db
            .prepare(
              `SELECT id, agent_id, timestamp, level, type, message, metadata
               FROM events
               ORDER BY timestamp DESC
               LIMIT ?`
            )
            .all(limit);

      return rows.map(rowToEvent);
    },
    close() {
      db.close();
    }
  };
}

type DatabaseLike = {
  exec(sql: string): void;
  prepare(sql: string): StatementLike;
  close(): void;
};

type StatementLike = {
  run(...values: unknown[]): void;
  all(...values: unknown[]): EventRow[];
};

type EventRow = {
  id: string;
  agent_id: string;
  timestamp: string;
  level: AgentEvent["level"];
  type: AgentEvent["type"];
  message: string;
  metadata: string | null;
};

function rowToEvent(row: EventRow): AgentEvent {
  return {
    id: row.id,
    agentId: row.agent_id,
    timestamp: row.timestamp,
    level: row.level,
    type: row.type,
    message: row.message,
    ...(row.metadata ? { metadata: JSON.parse(row.metadata) as AgentEvent["metadata"] } : {})
  };
}
