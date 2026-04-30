import type { LiveMessage } from "@agent-village/shared";
import type { ConnectionState } from "../stores/dashboardStore";
import { getLiveUrl } from "./client";

export function connectLiveStream(
  onMessage: (message: LiveMessage) => void,
  onState: (state: ConnectionState) => void
): () => void {
  onState("connecting");
  const socket = new WebSocket(getLiveUrl());

  socket.addEventListener("open", () => onState("connected"));
  socket.addEventListener("close", () => onState("offline"));
  socket.addEventListener("error", () => onState("offline"));
  socket.addEventListener("message", (event) => {
    const parsed = JSON.parse(String(event.data)) as LiveMessage;
    onMessage(parsed);
  });

  return () => socket.close();
}
