import { mapHeight, mapWidth, tileHeight } from "../data/villageLayout";

export function getVillageOrigin(screenWidth: number) {
  return {
    x: Math.round(screenWidth / 2),
    y: Math.max(74, Math.round((screenWidth < 760 ? 46 : 64) - mapHeight * tileHeight * 0.08))
  };
}

export function getVillageBounds() {
  return {
    mapWidth,
    mapHeight
  };
}
