import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { deriveAgentCounts, deriveBuildingVisualStates } from "@agent-village/shared";
import { BottomStatusBar } from "../components/BottomStatusBar";
import { AgentSidebar } from "../components/AgentSidebar";
import { SelectedAgentPanel } from "../components/SelectedAgentPanel";
import { TopBar } from "../components/TopBar";
import { VillageCanvas } from "../village/VillageCanvas";
import { useDashboardStore } from "../stores/dashboardStore";

interface DashboardLayoutProps {
  serverStartTime: number | null;
}

export function DashboardLayout({ serverStartTime }: DashboardLayoutProps) {
  const agentsById = useDashboardStore((state) => state.agents);
  const agents = useMemo(() => Object.values(agentsById), [agentsById]);
  const counts = useMemo(() => deriveAgentCounts(agents), [agents]);
  const statusFilter = useDashboardStore((state) => state.statusFilter);
  const setStatusFilter = useDashboardStore((state) => state.setStatusFilter);
  const connectionState = useDashboardStore((state) => state.connectionState);
  const buildingStates = useMemo(() => deriveBuildingVisualStates(agents), [agents]);
  const uptime = useUptime(serverStartTime);
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

function useUptime(serverStartTime: number | null) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const startTime = serverStartTime ?? Date.now();
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(elapsed / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, "0");
  const seconds = Math.floor(elapsed % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
