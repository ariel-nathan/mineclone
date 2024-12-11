import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { WorldRenderer } from "../render/world-renderer";
import { World } from "../world";

export function debugControls(world: World, worldRenderer: WorldRenderer) {
  const gui = new GUI();

  const worldFolder = gui.addFolder("World");
  worldFolder.add(world, "seed", 0, 10000, 1).name("Seed");
  worldFolder.add(world, "width", 8, 128, 1).name("Width");
  worldFolder.add(world, "height", 8, 128, 1).name("Height");
  worldFolder.add(world.options, "scale", 1, 100, 1).name("Scale");
  worldFolder.add(world.options, "magnitude", 0, 1, 0.01).name("Magnitude");
  worldFolder.add(world.options, "offset", 0, 1, 0.01).name("Offset");

  gui.onChange(() => {
    world.generate();
    worldRenderer.render();
  });
}
