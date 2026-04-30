import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { deriveAgentCounts, deriveBuildingVisualStates } from "@agent-village/shared";
import { BottomStatusBar } from "../components/BottomStatusBar";
import { AgentSidebar } from "../components/AgentSidebar";
import { SelectedAgentPanel } from "../components/SelectedAgentPanel";
import { TopBar } from "../components/TopBar";
import { VillageCanvas } from "../village/VillageCanvas";
import {
  useDashboardStore
} from "../stores/dashboardStore";

export function DashboardLayout() {
  const agentsById = useDashboardStore((state) => state.agents);
  const agents = useMemo(() => Object.values(agentsById), [agentsById]);
  const counts = useMemo(() => deriveAgentCounts(agents), [agents]);
  const statusFilter = useDashboardStore((state) => state.statusFilter);
  const setStatusFilter = useDashboardStore((state) => state.setStatusFilter);
  const connectionState = useDashboardStore((state) => state.connectionState);
  const buildingStates = useMemo(() => deriveBuildingVisualStates(agents), [agents]);
  const uptime = useUptime();
  const activity = useMemo(() => {
    const average = buildingStates.reduce((sum, state) => sum + state.activityLevel, 0) / Math.max(buildingStates.length, 1);
    return average > 0.62 ? "High" : average > 0.25 ? "Moderate" : "Low";
  }, [buildingStates]);

  return (
    <div className="dashboard-shell">
      <TopBar counts={counts} uptime={uptime} activeStatus={statusFilter} onStatusClick={setStatusFilter} />
      <main className="dashboard-main">
        <AgentSidebar />
        <VillageCanvas />
        <SelectedAgentPanel />
      </main>
      <BottomStatusBar connectionState={connectionState} activity={activity} />
    </div>
  );
}

function useUptime() {
  const started = useMemo(() => Date.now(), []);
  const now = Date.now();
  const elapsed = Math.floor((now - started) / 1000) + 3 * 60 * 60 + 42 * 60 + 18;
  const hours = Math.floor(elapsed / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, "0");
  const seconds = Math.floor(elapsed % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
