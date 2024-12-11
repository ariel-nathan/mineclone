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
    console.log("Generating world...");

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

    console.log("World generated.");
  }

  getBlock(x: number, y: number, z: number) {
    const index = x + y * this.width + z * this.width * this.height;
    return this.world[index];
  }

  setBlock(x: number, y: number, z: number, id: number) {
    const index = x + y * this.width + z * this.width * this.height;
    this.world[index] = id;
  }
}
