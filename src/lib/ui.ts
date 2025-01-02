import GUI from "lil-gui";
import { GPURenderer } from "../render/gpu-renderer";
import { World } from "../world";
import { Block, BlockProperties, GenerativeBlocks } from "../world/block";

// Debug UI controls for world generation parameters
export function debugControls(world: World, renderer: GPURenderer) {
  const gui = new GUI();

  // World parameters
  const worldFolder = gui.addFolder("World").close();
  worldFolder.add(world, "seed", 0, 10000, 1).name("Seed");
  worldFolder.add(world, "width", 8, 128, 1).name("Width");
  worldFolder.add(world, "height", 8, 128, 1).name("Height");
  worldFolder.add(world.options, "scale", 1, 100, 1).name("Scale");
  worldFolder.add(world.options, "magnitude", 0, 1, 0.01).name("Magnitude");
  worldFolder.add(world.options, "offset", 0, 1, 0.01).name("Offset");

  // Ore generation parameters
  const oreFolder = gui.addFolder("Ores").close();
  Object.entries(GenerativeBlocks).forEach(([blockId, properties]) => {
    const block = parseInt(blockId) as Block;
    const name = BlockProperties[block].name;
    const folder = oreFolder.addFolder(name).close();
    folder.add(properties, "scale", 1, 50, 1).name("Scale");
    folder.add(properties, "scarcity", 0, 1, 0.05).name("Scarcity");
  });

  gui.onChange(() => {
    world.generate();
    renderer.updateWorld(world);
  });
}
