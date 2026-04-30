export const tileWidth = 96;
export const tileHeight = 48;
export const mapWidth = 13;
export const mapHeight = 10;

export function isoToScreen(x: number, y: number, originX: number, originY: number) {
  return {
    x: originX + (x - y) * (tileWidth / 2),
    y: originY + (x + y) * (tileHeight / 2)
  };
}

export function isRoadTile(x: number, y: number) {
  return x === y || x + y === 10 || (y === 5 && x > 1 && x < 11);
}
