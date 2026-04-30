import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { deriveBuildingVisualStates } from "@agent-village/shared";
import { renderVillage } from "./pixi/renderBuildings";
import { createPixiApp } from "./pixi/createPixiApp";
import {
  useDashboardStore
} from "../stores/dashboardStore";

export function VillageCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Awaited<ReturnType<typeof createPixiApp>> | null>(null);
  const agentsById = useDashboardStore((state) => state.agents);
  const buildingStates = useMemo(() => deriveBuildingVisualStates(Object.values(agentsById)), [agentsById]);
  const selectedBuildingId = useDashboardStore((state) => state.selectedBuildingId);
  const hoveredBuildingId = useDashboardStore((state) => state.hoveredBuildingId);
  const statusFilter = useDashboardStore((state) => state.statusFilter);
  const selectBuilding = useDashboardStore((state) => state.selectBuilding);
  const hoverBuilding = useDashboardStore((state) => state.hoverBuilding);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 120);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let disposed = false;
    const container = containerRef.current;
    if (!container) return undefined;

    void createPixiApp(container).then((app) => {
      if (disposed) {
        app.destroy(true);
        return;
      }
      appRef.current = app;
    });

    return () => {
      disposed = true;
      appRef.current?.destroy(true);
      appRef.current = null;
    };
  }, []);

  const memoizedStates = useMemo(() => buildingStates, [buildingStates]);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    renderVillage(app.stage, app.screen.width, app.screen.height, {
      buildingStates: memoizedStates,
      selectedBuildingId,
      hoveredBuildingId,
      statusFilter,
      onSelectBuilding: selectBuilding,
      onHoverBuilding: hoverBuilding,
      tick
    });
  }, [memoizedStates, selectedBuildingId, hoveredBuildingId, statusFilter, selectBuilding, hoverBuilding, tick]);

  return (
    <section className="village-stage" aria-label="Isometric agent village">
      <div ref={containerRef} className="village-canvas-host" />
      <div className="village-overlay">
        <span>Live Map</span>
        <span>{buildingStates.length} active zones</span>
      </div>
    </section>
  );
}
