import type { LiveMessage } from "@agent-village/shared";
import type { ConnectionState } from "../stores/dashboardStore";
import { getLiveUrl } from "./client";

const RECONNECT_DELAYS = [1000, 2000, 5000, 10000]; // exponential backoff, max 10s
const MAX_RECONNECT_INDEX = RECONNECT_DELAYS.length - 1;

export function connectLiveStream(
  onMessage: (message: LiveMessage) => void,
  onState: (state: ConnectionState) => void
): () => void {
  let attempt = 0;
  let disposed = false;
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const clearReconnect = () => {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const connect = () => {
    if (disposed) return;
    onState("connecting");
    socket = new WebSocket(getLiveUrl());

    socket.addEventListener("open", () => {
      attempt = 0;
      onState("connected");
    });

    socket.addEventListener("close", () => {
      if (disposed) return;
      onState("offline");
      const delay = RECONNECT_DELAYS[Math.min(attempt, MAX_RECONNECT_INDEX)];
      attempt = Math.min(attempt + 1, MAX_RECONNECT_INDEX);
      reconnectTimer = setTimeout(connect, delay);
    });

    socket.addEventListener("error", () => {
      if (disposed) return;
      socket?.close();
    });

    socket.addEventListener("message", (event) => {
      const parsed = JSON.parse(String(event.data)) as LiveMessage;
      onMessage(parsed);
    });
  };

  connect();

  return () => {
    disposed = true;
    clearReconnect();
    socket?.close();
  };
}
