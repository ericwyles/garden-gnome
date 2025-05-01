import { LAYOUTS, MUTATION_CONFIGS } from "./data";
import { minigame } from "./utils";
import Logger from "./logger";
import { LayoutConfig, TileConfig } from "./types/gardenGnome";

/**
 * Gets the current level of the Garden minigame.
 * The maximum effective level for garden size and mutation rates is 9.
 * @returns The garden level, capped at 9.
 */
export const getGardenLevel = () => Math.min(minigame.parent.level, 9);

/**
 * Adjusts the coordinates of a layout configuration based on the garden level.
 * This effectively centers the layout within the available garden plot,
 * ensuring layouts expand correctly as the garden levels up.
 * @param level - The current garden level (1-9).
 * @param layout - The base layout configuration to offset.
 * @returns A new layout configuration with adjusted x, y coordinates.
 */
const offsetLayout = (level: number, layout: LayoutConfig): LayoutConfig => {
  // plotLimits provides the top-left corner offset for the usable area at a given level.
  const [xDelta, yDelta] = minigame.plotLimits[level - 1];
  return layout.map((tile) => ({
    ...tile,
    x: tile.x + xDelta,
    y: tile.y + yDelta,
  }));
};

/**
 * Retrieves a specific layout configuration by its key and adjusts it for the current garden level.
 * It fetches the base layout and then applies the necessary offset.
 * @param layoutKey - The string identifier of the desired layout (e.g., "oneParent", "fullGarden").
 * @param level - The current garden level (1-9).
 * @returns The level-adjusted layout configuration, or `null` if the layout doesn't exist for the given key and level.
 */
const getLayoutByKeyAndLevel = (
  layoutKey: string,
  level: number
): LayoutConfig | null => {
  // Retrieve the base layout for the specific level from the LAYOUTS constant.
  let layout = LAYOUTS[layoutKey]?.[level] || null;
  if (layout) {
    // If found, offset it to center it for the current garden size.
    layout = offsetLayout(level, layout);
  }
  return layout;
};

/** Stores keys of layout/config errors that have already been logged to prevent console flooding. */
const loggedLayoutErrors = new Set<string>();

/**
 * Gets the appropriate, level-adjusted layout configuration required to achieve a specific target plant or upgrade.
 * It looks up the mutation configuration for the target, finds the associated layout key,
 * retrieves the layout for the current garden level, and applies the necessary coordinate offsets.
 * Logs an error if the mutation config or layout definition is missing.
 * @param target - The key (string identifier) of the target plant or upgrade. If undefined, returns undefined.
 * @returns The level-adjusted `LayoutConfig` for the target, or `undefined` if the target,
 *          its mutation config, or its layout for the current level cannot be found.
 */
export const getLayoutConfigForTarget = (
  target?: string
): LayoutConfig | undefined => {
  if (!target) return undefined;
  const level = getGardenLevel();
  const config = MUTATION_CONFIGS[target];
  if (!config) {
    const errorKey = `no-config-${target}`;
    if (!loggedLayoutErrors.has(errorKey)) {
      Logger.error(`[ERROR] No mutation config found for ${target}`);
      loggedLayoutErrors.add(errorKey); // Add to set after logging
    }
    return undefined;
  }
  // Retrieve the layout using the key specified in the target's mutation config.
  const layout = getLayoutByKeyAndLevel(config.layout, level);
  if (!layout) {
    const errorKey = `no-layout-${target}-level-${level}`;
    if (!loggedLayoutErrors.has(errorKey)) {
      Logger.error(
        `[ERROR] No layout defined for ${target} on garden level ${level}`
      );
      loggedLayoutErrors.add(errorKey); // Add to set after logging
    }
    return undefined;
  }
  return layout;
};

/**
 * Determines the specific parent plant expected to be planted on a given tile within a target's layout.
 * It uses the `parents` array from the target's mutation configuration and the `parent` index.
 * @param target - The key (string identifier) of the target plant whose layout is being considered.
 * @param tile - The specific `TileConfig` object from the layout, representing the tile in question.
 *               It's expected to have a `parent` property (index) if the target requires multiple distinct parents.
 * @returns The `GamePlant` object representing the expected parent plant for that tile.
 * @throws If the expected plant key derived from the configuration does not correspond to a valid plant in the game.
 */
export const getExpectedPlantForLayoutTile = (
  target: string,
  tile: TileConfig
): GamePlant => {
  const { parents } = MUTATION_CONFIGS[target];

  // To reduce burden in manual creation of `data.ts`, this makes it unnecessary to
  // add `parent: 0` to hundreds of entries in layouts where there is only one parent.
  const expectedPlantKey =
    parents.length === 1 ? parents[0] : parents[tile.parent!];

  return minigame.plants[expectedPlantKey];
};

// --- Dynamic fullGarden Layout Generation ---
// This block automatically generates the "fullGarden" layout configurations for all possible garden levels (1 through 9).
// It iterates through the defined garden sizes for each level, creating a layout config
// that includes a tile for every single plot coordinate available at that level.
// This avoids manually defining the full layout for each size.
// Object.values(LEVEL_TO_SIZE).forEach((size, index) => {
//   const level = index + 1; // Garden levels are 1-based index.
//   const [cols, rows] = size.split("x").map(Number); // Parse "cols x rows" string.
//   const layout: LayoutConfig = [];
//   // Create a tile config for every coordinate in the grid.
//   for (let y = 0; y < rows; y++) {
//     for (let x = 0; x < cols; x++) {
//       layout.push({ x, y }); // Base coordinates before offsetting.
//     }
//   }
//   // Ensure the 'fullGarden' key exists in the main LAYOUTS object.
//   if (!LAYOUTS.fullGarden) {
//     LAYOUTS.fullGarden = {};
//   }
//   // Store the generated layout for the current level under the 'fullGarden' key.
//   // This layout will later be offset when retrieved by getLayoutByKeyAndLevel.
//   LAYOUTS.fullGarden[level] = layout;
// });
