import { SimplexNoise } from "three/examples/jsm/Addons.js";
import { RNG } from "../lib/rng";
import { Block } from "./block";

interface WorldOptions {
  scale: number;
  magnitude: number;
  offset: number;
}

export class World {
  public seed: number;
  public width: number;
  public height: number;
  public options: WorldOptions;

  private primaryNoise: SimplexNoise;
  private world: Uint8Array;

  constructor(
    seed: number = 0,
    width: number = 64,
    height: number = 32,
    options: Partial<WorldOptions> = {}
  ) {
    this.seed = seed;
    this.width = width;
    this.height = height;
    this.options = {
      scale: 30,
      magnitude: 0.2,
      offset: 0.5,
      ...options,
    };
    this.world = new Uint8Array(this.width * this.height * this.width);
    this.primaryNoise = new SimplexNoise();

    this.initialize();
  }

  initialize() {
    const primaryRNG = new RNG(this.seed);
    this.primaryNoise = new SimplexNoise(primaryRNG);

    const world = new Uint8Array(this.width * this.height * this.width);
    world.fill(Block.AIR);
    this.world = world;
  }

  generate() {
    this.initialize();

    for (let x = 0; x < this.width; x++) {
      for (let z = 0; z < this.width; z++) {
        const noiseValue = this.primaryNoise.noise(
          x / this.options.scale,
          z / this.options.scale
        );

        const height = Math.floor(
          Math.max(
            0,
            Math.min(
              this.height *
                (this.options.offset + this.options.magnitude * noiseValue),
              this.height - 1
            )
          )
        );

        for (let y = 0; y <= height; y++) {
          const block = y === height ? Block.GRASS : Block.DIRT;
          this.setBlock(x, y, z, block);
        }
      }
    }
  }

  private isOutOfBounds(x: number, y: number, z: number): boolean {
    return (
      x < 0 ||
      x >= this.width ||
      y < 0 ||
      y >= this.height ||
      z < 0 ||
      z >= this.width
    );
  }

  getBlock(x: number, y: number, z: number) {
    if (this.isOutOfBounds(x, y, z)) {
      return Block.AIR; // Return air for out of bounds
    }
    const index = x + y * this.width + z * this.width * this.height;
    return this.world[index];
  }

  setBlock(x: number, y: number, z: number, id: number) {
    if (this.isOutOfBounds(x, y, z)) {
      return; // Silently fail for out of bounds
    }
    const index = x + y * this.width + z * this.width * this.height;
    this.world[index] = id;
  }

  isBlockVisible(x: number, y: number, z: number): boolean {
    // If the block is air, it's not visible
    if (this.getBlock(x, y, z) === Block.AIR) {
      return false;
    }

    // Check all 6 faces
    return (
      this.isBlockFaceExposed(x + 1, y, z) || // Right
      this.isBlockFaceExposed(x - 1, y, z) || // Left
      this.isBlockFaceExposed(x, y + 1, z) || // Top
      this.isBlockFaceExposed(x, y - 1, z) || // Bottom
      this.isBlockFaceExposed(x, y, z + 1) || // Front
      this.isBlockFaceExposed(x, y, z - 1) // Back
    );
  }

  private isBlockFaceExposed(x: number, y: number, z: number): boolean {
    // Check if the position is out of bounds
    if (this.isOutOfBounds(x, y, z)) {
      return true;
    }

    return this.getBlock(x, y, z) === Block.AIR;
  }

  getVisibleBlocks() {
    // Maximum possible visible blocks (width * height * width)
    const maxBlocks = this.width * this.height * this.width;

    // Pre-allocate typed arrays
    const positions = new Float32Array(maxBlocks * 3); // x,y,z for each block
    const ids = new Uint8Array(maxBlocks);
    let count = 0;

    // Iterate through all blocks
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        for (let z = 0; z < this.width; z++) {
          if (this.isBlockVisible(x, y, z)) {
            const index = count * 3;
            positions[index] = x;
            positions[index + 1] = y;
            positions[index + 2] = z;
            ids[count] = this.getBlock(x, y, z);
            count++;
          }
        }
      }
    }

    // Return only the used portions of the arrays
    return {
      positions: new Float32Array(positions.buffer, 0, count * 3),
      ids: new Uint8Array(ids.buffer, 0, count),
      count,
    };
  }
}
