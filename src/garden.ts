import { minigame } from "./utils";
import { isUpgradeTarget } from "./mutationStrategy";
import { getExpectedPlantForLayoutTile, getGardenLevel } from "./gardenLayout";
import { getTileInfo as getGameTileInfo } from "./tile";
import { MUTATION_CONFIGS, SOIL, STAGE } from "./data";
import {
  TileStatus,
  LayoutConfig,
  PlotData,
  EmptyTile,
  NonEmptyTile,
  PlotTile,
} from "./types/gardenGnome";

/**
 * Calculates the minimum number of ticks required for any currently planted plant
 * that matches the layout configuration to reach maturity.
 * Returns -Infinity if no layout-matching plants are currently planted.
 *
 * @param plotData - The current state of the garden plot with enhanced tile data.
 * @returns The minimum ticks to maturity for planted layout plants, or -Infinity if none exist.
 */
export const getTicksToPlantedMaturity = (plotData: PlotData): number => {
  const planted = plotData.filter((t) => t.status === TileStatus.LayoutPlanted);
  return planted.length
    ? Math.min(...planted.map((t) => t.ticksToMature))
    : -Infinity;
};

/**
 * Calculates the maximum number of ticks remaining before any currently planted plant
 * that matches the layout configuration starts to decay.
 *
 * @param plotData - The current state of the garden plot with enhanced tile data.
 * @returns The maximum ticks before decay for planted layout plants, or -Infinity if none exist.
 */
export const getTicksToPlantedDecay = (plotData: PlotData): number =>
  Math.max(
    ...plotData
      .filter((t) => t.status === TileStatus.LayoutPlanted)
      .map((p) => p.ticksToDecay)
  );

/**
 * Calculates the maximum number of ticks required for any currently unplanted tile
 * (where a plant is expected according to the layout) to reach maturity if planted now.
 *
 * @param plotData - The current state of the garden plot with enhanced tile data.
 * @returns The maximum ticks to maturity for unplanted layout tiles, or -Infinity if none exist.
 */
export const getTicksUnplantedMaturity = (plotData: PlotData): number =>
  Math.max(
    ...plotData
      .filter((t) => t.status === TileStatus.LayoutUnplanted)
      .map((u) => u.ticksToMature)
  );

/**
 * Simulates clicking the soil selection button in the Garden minigame UI.
 * This is a wrapper around the game's native click logic to ensure compatibility.
 *
 * @param soil - The GameSoil object representing the soil to switch to.
 */
const changeSoil = (soil: GameSoil): void => {
  // const soilEl = document.querySelector<HTMLDivElement>(
  //   `gardenSoil-${soil.id}`
  // );
  const soilEl = l(`gardenSoil-${soil.id}`);
  soilEl?.click();
};

/**
 * Selects the optimal soil type based on the current garden target and plot state.
 * Uses Fertilizer for growth/upgrade targets (unless specific conditions apply)
 * and Wood Chips for mutation targets or when specific plants require it.
 * Defaults to Fertilizer if no target or plot data is provided.
 *
 * @param target - The current mutation or upgrade target key (optional).
 * @param plotData - The current state of the garden plot with enhanced tile data (optional).
 */
export const optimizeSoil = (
  target?: string | undefined,
  plotData?: PlotData
): void => {
  const woodChips = minigame.soilsById[SOIL.woodchips];
  const fertilizer = minigame.soilsById[SOIL.fertilizer];
  if (!target || !plotData) {
    changeSoil(fertilizer);
  } else {
    const { parents } = MUTATION_CONFIGS[target];

    const ticksToLayoutMaturity = getTicksToPlantedMaturity(plotData);

    // Cronerice matures in <10 minutes -- don't toggle back and forth
    const hasFastMaturingParents = ["cronerice"].includes(target);
    // Check Ichorpuff slows down aging -- keep fertilizer to move as fast as possible
    const hasAgeSlowingPlants = parents.includes("ichorpuff"); // Example check, adjust based on actual plant data structure

    // If no age-slowing plant is present and either the plant is an upgrade target
    // or it takes more than 0 ticks to mature (and doesn't have fast maturing parents),
    // use fertilizer. Otherwise, we're attempting a mutation so use woodchips.
    // When nothing is planted yet (ticksToLayoutMaturity === -Infinity), use fertilizer to grow the setup.
    const targetSoil =
      !hasAgeSlowingPlants &&
      (isUpgradeTarget(target) ||
        ticksToLayoutMaturity !== 0 && !hasFastMaturingParents)
        ? fertilizer
        : woodChips;

    changeSoil(targetSoil);
  }
};

/**
 * Calculates the effective age increase per garden tick for a specific plant at a given tile location.
 * Considers base age tick rate, random variation (averaged), plot boosts, and Dragon Auras.
 *
 * @param plant - The GamePlant object.
 * @param x - The x-coordinate of the tile.
 * @param y - The y-coordinate of the tile.
 * @returns The calculated age increase per tick.
 */
const getAgePerTick = (plant: GamePlant, x: number, y: number): number => {
  const dragonBoost = 1 + 0.05 * Game.auraMult("Supreme Intellect");
  // miniGame multiplies plant.ageTickR[andom] by Math.Random(), but of course this normalizes to 0.5 across large numbers.
  const agePerTick =
    (plant.ageTick + plant.ageTickR * 0.5) *
    minigame.plotBoost[y][x][0] *
    dragonBoost;
  return agePerTick;
};

/**
 * Calculates the remaining ticks until a plant at a specific tile reaches maturity.
 * Returns 0 if the plant is already mature, Infinity if the tile is empty.
 *
 * @param x - The x-coordinate of the tile.
 * @param y - The y-coordinate of the tile.
 * @returns The number of ticks until maturity, 0, or Infinity.
 */
const getTicksToMature = (x: number, y: number): number => {
  const { plant, stage, age } = getGameTileInfo(x, y);
  if (!plant) return Infinity;
  if (stage === STAGE.mature) return 0;
  const agePerTick = getAgePerTick(plant, x, y);
  return Math.floor((plant.mature - age) / agePerTick); // Use `floor` to ensure event isn't missed
};

/**
 * Calculates the remaining ticks until a plant at a specific tile decays.
 * Returns Infinity if the plant is immortal or the tile is empty.
 *
 * @param x - The x-coordinate of the tile.
 * @param y - The y-coordinate of the tile.
 * @returns The number of ticks until decay or Infinity.
 */
const getTicksToDecay = (x: number, y: number): number => {
  const { plant, age } = getGameTileInfo(x, y);
  if (!plant) return Infinity;
  if (plant.immortal) return Infinity;
  const agePerTick = getAgePerTick(plant, x, y);
  return Math.floor((100 - age) / agePerTick); // Use `floor` to ensure event isn't missed
};

/**
 * Calculates the total number of ticks required for a specific plant type to mature
 * from age 0 if planted at the given coordinates.
 *
 * @param plant - The GamePlant object representing the species.
 * @param x - The x-coordinate where the plant would be planted.
 * @param y - The y-coordinate where the plant would be planted.
 * @returns The total number of ticks required for the plant to mature.
 */
export const getTicksToMatureForPlantType = (
  plant: GamePlant,
  x: number,
  y: number
): number => {
  const agePerTick = getAgePerTick(plant, x, y);
  return Math.floor(plant.mature / agePerTick); // Use `floor` to ensure event isn't missed
};

/**
 * Analyzes the entire garden plot and returns an array of enhanced tile data.
 * Each element represents a tile and includes its game state, coordinates,
 * expected plant based on the layout (if any), calculated status (Empty, Invalid,
 * LayoutPlanted, LayoutUnplanted, Incorrect, Locked), and calculated ticks
 * to maturity and decay.
 *
 * @param layout - The layout configuration defining expected plants for tiles (optional).
 * @param target - The current mutation or upgrade target key (optional).
 * @returns An array of PlotTile objects representing the enhanced state of each garden tile.
 */
export const getEnhancedPlotData = (
  layout: LayoutConfig | undefined,
  target: string | undefined
): PlotTile[] => {
  const level = getGardenLevel();
  // Ensure plotLimits exists and has data for the current level
  const limits = minigame.plotLimits[level - 1];
  if (!limits) {
    return []; // Return empty array or handle error appropriately
  }
  const [xMin, yMin, xMax, yMax] = limits;

  const plot: PlotTile[] = minigame.plot.flatMap((row, y) =>
    row.map((_col, x): PlotTile => {
      const gameTile = getGameTileInfo(x, y);
      const tileConfig = layout?.find((t) => t.x === x && t.y === y);
      const expectedPlant = (() => {
        // No target means no specific plant is "expected" by the layout logic
        if (!target || !tileConfig) return undefined;
        return getExpectedPlantForLayoutTile(target, tileConfig);
      })();

      const status = (() => {
        // Tile is outside the boundaries of the unlocked plot
        if (x < xMin || x >= xMax || y < yMin || y >= yMax)
          return TileStatus.Invalid;

        // No plant exists on tile
        if (!gameTile.plant) {
          // If a plant is expected here by the layout, it's Unplanted, otherwise Empty
          return tileConfig ? TileStatus.LayoutUnplanted : TileStatus.Empty;
        }

        // Plant exists on tile. Check its status.
        if (!gameTile.plant.unlocked) return TileStatus.Locked; // Locked plants take precedence

        // If a plant is expected, check if the current plant matches
        if (
          tileConfig &&
          expectedPlant &&
          gameTile.plant.key === expectedPlant.key
        ) {
          return TileStatus.LayoutPlanted;
        }

        // If we reach here, the plant is unlocked but either:
        // 1. No plant was expected by the layout (tileConfig is undefined)
        // 2. A different plant was expected by the layout
        // 3. The tile should be empty according to the layout (tileConfig exists but expectedPlant is undefined)
        // In all these cases, the existing plant is considered Incorrect for the current strategy.
        return TileStatus.Incorrect;
      })();

      const plant =
        status === TileStatus.LayoutUnplanted ? expectedPlant : gameTile.plant;

      // Determine the plant object to use for calculations
      // If the tile is meant for a layout plant but is empty, use the expected plant for maturity calc.
      // Otherwise, use the plant actually present (or null if empty/invalid).
      const ticksToMature =
        status === TileStatus.LayoutUnplanted
          ? getTicksToMatureForPlantType(plant!, x, y)
          : getTicksToMature(x, y);

      const ticksToDecay = getTicksToDecay(x, y);

      const plotTile = {
        ...gameTile,
        plant,
        x,
        y,
        status,
        ticksToMature,
        ticksToDecay,
      };

      if (status === TileStatus.Empty || status === TileStatus.Invalid) {
        return { ...plotTile, plant: undefined } as EmptyTile;
      }

      return plotTile as NonEmptyTile;
    })
  );
  return plot;
};
