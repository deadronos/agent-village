import type { DashboardSnapshot, LiveMessage } from "@agent-village/shared";

export type LiveClient = {
  send(payload: string): void;
  close?: () => void;
};

export type Broadcaster = {
  addClient(client: LiveClient): void;
  removeClient(client: LiveClient): void;
  broadcast(message: LiveMessage): void;
  clientCount(): number;
};

export function createBroadcaster(snapshotFactory: () => Promise<DashboardSnapshot>): Broadcaster {
  const clients = new Set<LiveClient>();

  return {
    addClient(client) {
      clients.add(client);
      void snapshotFactory().then((snapshot) => {
        client.send(JSON.stringify({ type: "snapshot", snapshot } satisfies LiveMessage));
      });
    },
    removeClient(client) {
      clients.delete(client);
    },
    broadcast(message) {
      const payload = JSON.stringify(message);
      for (const client of clients) {
        client.send(payload);
      }
    },
    clientCount() {
      return clients.size;
    }
  };
}
