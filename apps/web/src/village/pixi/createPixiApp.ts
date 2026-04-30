import { Application } from "pixi.js";

export async function createPixiApp(container: HTMLDivElement): Promise<Application> {
  const app = new Application();
  await app.init({
    resizeTo: container,
    backgroundAlpha: 0,
    antialias: false,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true
  });
  app.canvas.className = "village-pixi-canvas";
  container.appendChild(app.canvas);
  return app;
}
