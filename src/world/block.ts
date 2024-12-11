// Basic block properties that all blocks share
interface BaseBlockProperties {
  name: string;
  solid: boolean;
  color: number;
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
  [Block.AIR]: { name: "Air", solid: false, color: 0x000000 },
  [Block.GRASS]: { name: "Grass", solid: true, color: 0x55aa55 },
  [Block.DIRT]: { name: "Dirt", solid: true, color: 0x825432 },
  [Block.STONE]: { name: "Stone", solid: true, color: 0x999999 },
  [Block.IRON_ORE]: { name: "Iron Ore", solid: true, color: 0x995555 },
  [Block.COAL_ORE]: { name: "Coal Ore", solid: true, color: 0x666666 },
  [Block.WOOD]: { name: "Wood", solid: true, color: 0x6c4a1e },
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
