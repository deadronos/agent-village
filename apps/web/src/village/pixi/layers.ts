import { Container } from "pixi.js";

export type VillageLayers = {
  terrain: Container;
  roads: Container;
  buildings: Container;
  effects: Container;
  labels: Container;
};

export function createLayers(): VillageLayers {
  return {
    terrain: new Container(),
    roads: new Container(),
    buildings: new Container(),
    effects: new Container(),
    labels: new Container()
  };
}
