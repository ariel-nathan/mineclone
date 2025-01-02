import { World } from "../world";
import { Block } from "../world/block";

export class BlockManager {
  private instances: Array<{
    position: [number, number, number];
    type: number;
  }> = [];

  private isBlockFaceVisible(
    world: World,
    x: number,
    y: number,
    z: number,
    face: number
  ): boolean {
    let checkX = x;
    let checkY = y;
    let checkZ = z;

    switch (face) {
      case 0:
        checkZ++;
        break; // Front (+Z)
      case 1:
        checkZ--;
        break; // Back (-Z)
      case 2:
        checkY++;
        break; // Top (+Y)
      case 3:
        checkY--;
        break; // Bottom (-Y)
      case 4:
        checkX++;
        break; // Right (+X)
      case 5:
        checkX--;
        break; // Left (-X)
    }

    if (
      checkX < 0 ||
      checkX >= world.width ||
      checkY < 0 ||
      checkY >= world.height ||
      checkZ < 0 ||
      checkZ >= world.width
    ) {
      return true;
    }

    return world.getBlock(checkX, checkY, checkZ) === Block.AIR;
  }

  addBlock(x: number, y: number, z: number, type: Block) {
    this.instances.push({
      position: [x, y, z],
      type: type,
    });
  }

  clear() {
    this.instances = [];
  }

  getInstances() {
    return this.instances;
  }

  updateFromWorld(world: World) {
    this.clear();

    for (let x = 0; x < world.width; x++) {
      for (let y = 0; y < world.height; y++) {
        for (let z = 0; z < world.width; z++) {
          const block = world.getBlock(x, y, z);
          if (block !== Block.AIR) {
            let isVisible = false;
            for (let face = 0; face < 6; face++) {
              if (this.isBlockFaceVisible(world, x, y, z, face)) {
                isVisible = true;
                break;
              }
            }

            if (isVisible) {
              this.addBlock(x, y, z, block);
            }
          }
        }
      }
    }
  }
}
