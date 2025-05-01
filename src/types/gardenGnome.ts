export {};

// Game Interfaces
// interface PlantConfig {
//   parents: string[];
//   layout: string;
// }

// interface GardenSizeRegistry {
//   [level: number]: string;
// }

export interface MutationConfig {
  parents: string[];
  layout: string;
}

export interface TileConfig {
  x: number;
  y: number;
  parent?: number;
}

export type LayoutConfig = TileConfig[];

export interface LayoutRegistry {
  [layoutKey: string]: {
    [size: string]: LayoutConfig;
  };
}
// interface TileMaturity {
//   tile: TileConfig;
//   plant: GamePlant;
//   ticksToMaturity: number;
// }
// interface TileMaturityAndDecay extends TileMaturity {
//   ticksToDecay: number;
// }

// interface TicksToLifecycleEvent {
//   ticksToPlantedMaturity: number;
//   ticksToPlantedDecay: number;
//   ticksToUnplantedMaturity: number;
// }

export enum TileStatus {
  LayoutPlanted, // In layout and planted
  LayoutUnplanted, // In layout and not currently planted
  Locked, // Locked plant growing
  Incorrect, // In layout and a different plant growing
  Empty, // Empty
  Invalid, // Locked from layout
}

interface BaseTile {
  age: number;
  x: number;
  y: number;
  ticksToMature: number;
  ticksToDecay: number;
}

export interface EmptyTile extends BaseTile {
  status: TileStatus.Empty | TileStatus.Invalid;
  plant?: undefined;
  stage?: undefined;
}

export interface NonEmptyTile extends BaseTile {
  status: Exclude<TileStatus, TileStatus.Empty | TileStatus.Invalid>;
  plant: GamePlant;
  stage: number;
}

export type PlotTile = EmptyTile | NonEmptyTile;
export type PlotData = PlotTile[];
