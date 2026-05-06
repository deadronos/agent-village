import { Container, Graphics, Polygon, Text } from "pixi.js";
import type { AgentStatus, BuildingVisualState } from "@agent-village/shared";
import { buildingDefinitions } from "../data/buildingDefinitions";
import { isoToScreen, isRoadTile, mapHeight, mapWidth, tileHeight, tileWidth } from "../data/villageLayout";
import { getVillageOrigin } from "./camera";
import { statusColor, statusLabel } from "./effects";

const MAX_RESIDENT_DOTS = 5;

const HIT_AREA_SCALE_X = 0.9;
const HIT_AREA_SCALE_Y = 1.0;

export type RenderVillageOptions = {
  selectedBuildingId: string | undefined;
  hoveredBuildingId: string | undefined;
  statusFilter: AgentStatus | undefined;
  buildingStates: BuildingVisualState[];
  onSelectBuilding: (buildingId: string) => void;
  onDeselect: () => void;
  onHoverBuilding: (buildingId?: string) => void;
  tick: number;
};

export function renderVillage(root: Container, width: number, height: number, options: RenderVillageOptions) {
  root.removeChildren();
  const scene = new Container();
  scene.x = width < 900 ? 12 : 0;
  scene.y = height < 600 ? 4 : 0;
  root.addChild(scene);

  const origin = getVillageOrigin(width);
  const stateByBuilding = new Map(options.buildingStates.map((state) => [state.buildingId, state]));

  // Background click area for deselect
  const bg = new Graphics();
  bg.rect(-5000, -5000, 10000, 10000);
  bg.fill({ color: 0x000000, alpha: 0 });
  bg.eventMode = "static";
  bg.on("pointertap", options.onDeselect);
  scene.addChild(bg);

  drawTerrain(scene, origin.x, origin.y);

  for (const building of buildingDefinitions) {
    const state = stateByBuilding.get(building.id);
    const status = state?.status ?? "offline";
    const isSelected = options.selectedBuildingId === building.id;
    const isHovered = options.hoveredBuildingId === building.id;
    const isFiltered = !options.statusFilter || status === options.statusFilter;
    const point = isoToScreen(building.x, building.y, origin.x, origin.y);
    const container = new Container();
    container.x = point.x;
    container.y = point.y;

    const pulse = status === "running" ? 0.5 + Math.sin(options.tick / 9) * 0.18 : status === "error" ? 0.65 : 0.22;
    const hitArea = createBuildingHitArea(building.width, building.depth);
    drawSelection(container, isSelected || isHovered, status, pulse);
    drawBuildingBody(container, building.width, building.depth, building.height, building.color, building.roofColor, status);
    drawResidentDots(container, state?.agentCount ?? 0, status, options.tick);
    drawLabel(container, building.name, status, state?.agentCount ?? 0, building.height);

    container.hitArea = hitArea;
    container.eventMode = "static";
    container.cursor = "pointer";
    container.on("pointertap", () => options.onSelectBuilding(building.id));
    container.on("pointerover", () => options.onHoverBuilding(building.id));
    container.on("pointerout", () => options.onHoverBuilding(undefined));
    container.alpha = isFiltered ? 1 : 0.28;

    scene.addChild(container);
  }

  drawForestFrame(scene, width, height, options.tick);
}

function createBuildingHitArea(widthTiles: number, depthTiles: number): Polygon {
  const halfW = (widthTiles * tileWidth * HIT_AREA_SCALE_X) / 2;
  const halfD = (depthTiles * tileWidth * HIT_AREA_SCALE_Y) / 2;
  const topY = -20;
  const bottomY = 50;
  return new Polygon([
    -halfW, bottomY,
    halfW, bottomY,
    halfW + 20, topY,
    -halfW - 20, topY
  ]);
}

function drawTerrain(scene: Container, originX: number, originY: number) {
  for (let y = 0; y < mapHeight; y += 1) {
    for (let x = 0; x < mapWidth; x += 1) {
      const point = isoToScreen(x, y, originX, originY);
      const tile = new Graphics();
      const water = x < 2 && y > 6;
      const road = isRoadTile(x, y);
      const color = water ? 0x12395a : road ? 0x4d4b45 : 0x1f4b33;
      tile.poly([0, -tileHeight / 2, tileWidth / 2, 0, 0, tileHeight / 2, -tileWidth / 2, 0]);
      tile.fill({ color, alpha: water ? 0.94 : 0.96 });
      tile.stroke({ color: road ? 0x777065 : 0x173326, alpha: 0.8, width: 1 });
      tile.x = point.x;
      tile.y = point.y;
      scene.addChild(tile);

      if (!road && !water && (x * 7 + y * 3) % 5 === 0) {
        const flower = new Graphics();
        flower.circle(point.x + ((x % 2) - 0.5) * 22, point.y + ((y % 3) - 1) * 7, 2);
        flower.fill({ color: (x + y) % 2 === 0 ? 0xf4bd38 : 0x9c6cff, alpha: 0.82 });
        scene.addChild(flower);
      }
    }
  }
}

function drawSelection(container: Container, active: boolean, status: AgentStatus, pulse: number) {
  if (!active) return;
  const ring = new Graphics();
  ring.ellipse(0, 18, 84 + pulse * 18, 34 + pulse * 6);
  ring.stroke({ color: statusColor[status], alpha: 0.9, width: 3 });
  ring.alpha = 0.78;
  container.addChild(ring);
}

function drawBuildingBody(
  container: Container,
  widthTiles: number,
  depthTiles: number,
  heightPx: number,
  wallColor: string,
  roofColor: string,
  status: AgentStatus
) {
  const halfW = (widthTiles * tileWidth) / 2;
  const halfD = (depthTiles * tileWidth) / 2;
  const baseY = 18;
  const color = Number.parseInt(wallColor.slice(1), 16);
  const roof = Number.parseInt(roofColor.slice(1), 16);

  const shadow = new Graphics();
  shadow.ellipse(0, baseY + 16, halfW * 0.92, halfD * 0.24);
  shadow.fill({ color: 0x02050a, alpha: 0.46 });
  container.addChild(shadow);

  const leftWall = new Graphics();
  leftWall.poly([-halfW / 2, baseY, 0, baseY + halfD / 4, 0, baseY + halfD / 4 - heightPx, -halfW / 2, baseY - heightPx]);
  leftWall.fill({ color, alpha: 0.95 });
  leftWall.stroke({ color: 0x111820, width: 2, alpha: 0.9 });
  container.addChild(leftWall);

  const rightWall = new Graphics();
  rightWall.poly([halfW / 2, baseY, 0, baseY + halfD / 4, 0, baseY + halfD / 4 - heightPx, halfW / 2, baseY - heightPx]);
  rightWall.fill({ color: shade(color, 0.76), alpha: 0.95 });
  rightWall.stroke({ color: 0x111820, width: 2, alpha: 0.9 });
  container.addChild(rightWall);

  const roofShape = new Graphics();
  roofShape.poly([0, baseY - heightPx - 34, halfW / 1.75, baseY - heightPx, 0, baseY - heightPx + 26, -halfW / 1.75, baseY - heightPx]);
  roofShape.fill({ color: roof, alpha: status === "offline" ? 0.42 : 1 });
  roofShape.stroke({ color: status === "error" ? 0xff5a68 : 0x15191f, width: status === "error" ? 4 : 2, alpha: 0.95 });
  container.addChild(roofShape);

  const glow = new Graphics();
  glow.roundRect(-18, baseY - heightPx + 8, 12, 18, 2);
  glow.roundRect(10, baseY - heightPx + 2, 12, 18, 2);
  glow.fill({ color: status === "offline" ? 0x343b44 : statusColor[status], alpha: status === "idle" ? 0.62 : 0.88 });
  container.addChild(glow);

  if (status === "error") {
    const smoke = new Graphics();
    smoke.circle(28, baseY - heightPx - 44, 8);
    smoke.circle(39, baseY - heightPx - 58, 11);
    smoke.circle(50, baseY - heightPx - 74, 13);
    smoke.fill({ color: 0x8a9098, alpha: 0.28 });
    container.addChild(smoke);
  }
}

function drawResidentDots(container: Container, count: number, status: AgentStatus, tick: number) {
  const visibleCount = Math.min(count, MAX_RESIDENT_DOTS);
  for (let index = 0; index < visibleCount; index += 1) {
    const dot = new Graphics();
    dot.circle(0, 0, 4);
    dot.fill({ color: statusColor[status], alpha: 0.86 });
    dot.stroke({ color: 0x071018, width: 1, alpha: 0.9 });
    dot.x = -36 + index * 18;
    dot.y = 58 + Math.sin(tick / 8 + index) * 3;
    container.addChild(dot);
  }
}

function drawLabel(container: Container, name: string, status: AgentStatus, count: number, heightPx: number) {
  const label = new Container();
  label.y = -heightPx - 78;

  const panel = new Graphics();
  const panelWidth = Math.max(112, name.length * 8 + 26);
  panel.roundRect(-panelWidth / 2, -21, panelWidth, 58, 6);
  panel.fill({ color: 0x101922, alpha: 0.92 });
  panel.stroke({ color: 0x30404f, alpha: 0.95, width: 1 });
  label.addChild(panel);

  const title = new Text({
    text: name.toUpperCase(),
    style: {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 12,
      fontWeight: "700",
      fill: 0xf7f3df
    }
  });
  title.anchor.set(0.5, 0);
  title.y = -15;
  label.addChild(title);

  const statusText = new Text({
    text: `${statusLabel[status]}${count > 1 ? ` · ${count}` : ""}`,
    style: {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 11,
      fill: statusColor[status]
    }
  });
  statusText.anchor.set(0.5, 0);
  statusText.y = 9;
  label.addChild(statusText);

  container.addChild(label);
}

function drawForestFrame(scene: Container, width: number, height: number, tick: number) {
  const count = Math.max(28, Math.floor(width / 42));
  for (let index = 0; index < count; index += 1) {
    const tree = new Graphics();
    const x = (index * 137) % Math.max(width, 1);
    const y = index % 2 === 0 ? 14 + ((index * 23) % 74) : height - 88 + ((index * 11) % 58);
    tree.poly([0, -18, 15, 10, -15, 10]);
    tree.fill({ color: 0x173e2b, alpha: 0.55 + Math.sin(tick / 30 + index) * 0.05 });
    tree.rect(-3, 8, 6, 12);
    tree.fill({ color: 0x3c2a1d, alpha: 0.7 });
    tree.x = x;
    tree.y = y;
    scene.addChild(tree);
  }
}

function shade(color: number, factor: number) {
  const r = Math.round(((color >> 16) & 255) * factor);
  const g = Math.round(((color >> 8) & 255) * factor);
  const b = Math.round((color & 255) * factor);
  return (r << 16) + (g << 8) + b;
}
