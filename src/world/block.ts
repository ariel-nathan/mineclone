// Basic block properties that all blocks share
interface BaseBlockProperties {
  name: string;
  solid: boolean;
  textureIndexes: [number, number, number, number, number, number]; // [right, left, top, bottom, front, back]
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

// Block definitions with their properties
export const BlockProperties: Record<Block, BaseBlockProperties> = {
  [Block.AIR]: {
    name: "Air",
    solid: false,
    textureIndexes: [0, 0, 0, 0, 0, 0],
  },
  [Block.GRASS]: {
    name: "Grass",
    solid: true,
    textureIndexes: [1, 1, 2, 3, 1, 1], // side, side, top, bottom, side, side
  },
  [Block.DIRT]: {
    name: "Dirt",
    solid: true,
    textureIndexes: [3, 3, 3, 3, 3, 3],
  },
  [Block.STONE]: {
    name: "Stone",
    solid: true,
    textureIndexes: [4, 4, 4, 4, 4, 4],
  },
  [Block.IRON_ORE]: {
    name: "Iron Ore",
    solid: true,
    textureIndexes: [5, 5, 5, 5, 5, 5],
  },
  [Block.COAL_ORE]: {
    name: "Coal Ore",
    solid: true,
    textureIndexes: [6, 6, 6, 6, 6, 6],
  },
  [Block.WOOD]: {
    name: "Wood",
    solid: true,
    textureIndexes: [7, 7, 7, 7, 7, 7],
  },
};

// Generation parameters for ores and terrain features
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
