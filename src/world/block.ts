import * as THREE from "three";
import { loadTexture } from "../lib/texture-loader";

// Basic block properties that all blocks share
interface BaseBlockProperties {
  name: string;
  solid: boolean;
  material:
    | THREE.Material
    | [
        THREE.Material,
        THREE.Material,
        THREE.Material,
        THREE.Material,
        THREE.Material,
        THREE.Material
      ];
}

// Properties for blocks that can generate with patterns
interface GenerativeProperties {
  scale: number;
  scarcity: number;
}

// Different block categories
enum BlockCategory {
  TERRAIN,
  ORE,
  VEGETATION,
}

// Block enum with categories in comments
export enum Block {
  // Terrain
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  // Ores
  IRON_ORE = 4,
  COAL_ORE = 5,
  // Vegetation
  WOOD = 6,
}

// Type for blocks that can generate as ores
type OreBlocks = Block.STONE | Block.IRON_ORE | Block.COAL_ORE;

const textures = {
  grass: await loadTexture("textures/grass.png"),
  grassSide: await loadTexture("textures/grass_side.png"),
  dirt: await loadTexture("textures/dirt.png"),
  stone: await loadTexture("textures/stone.png"),
  coalOre: await loadTexture("textures/coal_ore.png"),
  ironOre: await loadTexture("textures/iron_ore.png"),
};

// Block definitions with their properties
export const BlockProperties: Record<Block, BaseBlockProperties> = {
  [Block.AIR]: {
    name: "Air",
    solid: false,
    material: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
  },

  [Block.GRASS]: {
    name: "Grass",
    solid: true,
    material: [
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.grass }), // top
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), // back
    ],
  },
  [Block.DIRT]: {
    name: "Dirt",
    solid: true,
    material: new THREE.MeshLambertMaterial({ map: textures.dirt }),
  },
  [Block.STONE]: {
    name: "Stone",
    solid: true,
    material: new THREE.MeshLambertMaterial({ map: textures.stone }),
  },
  [Block.IRON_ORE]: {
    name: "Iron Ore",
    solid: true,
    material: new THREE.MeshLambertMaterial({ map: textures.ironOre }),
  },
  [Block.COAL_ORE]: {
    name: "Coal Ore",
    solid: true,
    material: new THREE.MeshLambertMaterial({ map: textures.coalOre }),
  },
  [Block.WOOD]: {
    name: "Wood",
    solid: true,
    material: new THREE.MeshLambertMaterial({ color: 0x6c4a1e }),
  },
};

// Generative properties for ores and terrain features
export const GenerativeBlocks: Record<OreBlocks, GenerativeProperties> = {
  [Block.STONE]: { scale: 30, scarcity: 0.5 },
  [Block.IRON_ORE]: { scale: 20, scarcity: 0.9 },
  [Block.COAL_ORE]: { scale: 15, scarcity: 0.75 },
};

// Categorize blocks for easy filtering
export const BlockCategories: Record<Block, BlockCategory> = {
  [Block.AIR]: BlockCategory.TERRAIN,
  [Block.GRASS]: BlockCategory.TERRAIN,
  [Block.DIRT]: BlockCategory.TERRAIN,
  [Block.STONE]: BlockCategory.TERRAIN,
  [Block.IRON_ORE]: BlockCategory.ORE,
  [Block.COAL_ORE]: BlockCategory.ORE,
  [Block.WOOD]: BlockCategory.VEGETATION,
};
