import { useEffect } from "react";
import { DashboardLayout } from "./app/DashboardLayout";
import { fetchInitialData } from "./api/client";
import { connectLiveStream } from "./api/liveStream";
import { seedAgents } from "./mock/mockAgents";
import { startMockSimulation } from "./mock/mockEvents";
import { useDashboardStore } from "./stores/dashboardStore";
import "./styles/app.css";

export default function App() {
  useEffect(() => {
    const store = useDashboardStore.getState();
    store.reset(seedAgents);

    let mockCleanup: (() => void) | undefined;
    const startMock = () => {
      if (mockCleanup) return;
      useDashboardStore.getState().setConnectionState("mock");
      mockCleanup = startMockSimulation(
        () => useDashboardStore.getState().agents,
        (payload) => useDashboardStore.getState().ingestLiveEvent({ type: "event", ...payload })
      );
    };

    void fetchInitialData()
      .then((payload) => {
        if (payload.agents.length > 0) {
          useDashboardStore.getState().setSnapshot(payload);
        } else {
          startMock();
        }
      })
      .catch(startMock);

    const disconnect = connectLiveStream(
      (message) => {
        if (message.type === "snapshot") {
          if (message.snapshot.agents.length > 0) {
            useDashboardStore.getState().setSnapshot(message.snapshot);
          } else {
            startMock();
          }
          return;
        }
        useDashboardStore.getState().ingestLiveEvent(message);
      },
      (state) => {
        useDashboardStore.getState().setConnectionState(state);
        if (state === "offline") startMock();
      }
    );

    const fallbackTimer = window.setTimeout(() => {
      const state = useDashboardStore.getState().connectionState;
      if (state !== "connected") startMock();
    }, 800);

    return () => {
      window.clearTimeout(fallbackTimer);
      disconnect();
      mockCleanup?.();
    };
  }, []);

  return <DashboardLayout />;
}
