import { minigame } from "./utils";
import { MUTATION_CONFIGS, GARDEN_UPGRADES } from "./data";
import { getTileInfo } from "./tile";
import {
  getExpectedPlantForLayoutTile,
  getLayoutConfigForTarget,
} from "./gardenLayout";

// /**
//  * Gets the current level of the Garden minigame.
//  * The maximum effective level for garden size and mutation rates is 9.
//  * @returns The garden level, capped at 9.
//  */
// export const getGardenLevel = () => Math.min(minigame.parent.level, 9);

/**
 * Calculates the total cookie cost required to plant the specific layout
 * associated with achieving a target plant or upgrade.
 * @param target - The key (string identifier) of the target plant or upgrade.
 * @returns The total cookie cost for planting the required layout. Returns 0 if the layout is not found.
 */
export const calculateTargetCost = (target: string) => {
  const layout = getLayoutConfigForTarget(target);
  return layout!.reduce((total, tile) => {
    const plant = getExpectedPlantForLayoutTile(target, tile);
    return total + minigame.getCost(plant);
  }, 0);
};

const SORT = {
  default: 0,
  cost: 1,
  optimized: 2,
};
// FOR TESTING, not set through config.
const CONFIG_SORT_BY = SORT.optimized;

const UNLOCK_PRIORITY: Record<string, number> = {
  queenbeet: 1,
  queenbeetLump: 2,
  tidygrass: 4,
  everdaisy: 3,
};

const sortOptimized = (a: string, b: string) =>
  (UNLOCK_PRIORITY[a] || Number.MAX_SAFE_INTEGER) -
  (UNLOCK_PRIORITY[b] || Number.MAX_SAFE_INTEGER);

const sortByCost = (a: string, b: string) =>
  calculateTargetCost(a) - calculateTargetCost(b);

const sortUnlockables = (a: string, b: string) => {
  if (CONFIG_SORT_BY === SORT.cost) return sortByCost(a, b);
  if (CONFIG_SORT_BY === SORT.optimized) return sortOptimized(a, b);
  return 0; // Sort by insert order
};

/**
 * Analyzes the current state of the garden to determine seed and upgrade statuses.
 * It categorizes seeds based on whether they are unlocked, currently growing but locked,
 * potentially unlockable (parents unlocked), or not yet unlockable (parents locked).
 * It also lists garden upgrades that haven't been unlocked yet.
 * @returns An object containing lists of seeds and upgrades based on their status:
 *  - `unlockableUpgrades`: Garden upgrades not yet unlocked (dropp).
 *  - `unlockedSeeds`: Seeds already unlocked.
 *  - `growingLockedSeeds`: Seeds currently planted in the garden but not yet unlocked.
 *  - `unlockableSeeds`: Seeds not yet unlocked, but whose parent plants are unlocked, sorted by priority.
 *  - `notUnlockableSeeds`: Seeds not yet unlocked, and whose parent plants are not yet unlocked.
 */
export const getSeedStatus = () => {
  const unlockableUpgrades = GARDEN_UPGRADES.filter(
    (u) => !Game.HasUnlocked(u)
  );

  const unlockedSeeds = minigame.plantsById
    .filter((p) => p.unlocked)
    .map((p) => p.key);

  const growingLockedSeeds = [
    ...new Set( // Use Set to ensure unique plant keys
      minigame.plot.flatMap((row, y) =>
        row
          .map((_col, x) => {
            const { plant } = getTileInfo(x, y);
            return plant && !plant.unlocked ? plant.key : null;
          })
          .filter((key): key is string => key !== null)
      )
    ),
  ];

  const parentsUnlocked = (plant: GamePlant): boolean => {
    const config = MUTATION_CONFIGS[plant.key];
    if (!config?.parents) return false;
    return config.parents.every((p) => minigame.plants[p]?.unlocked);
  };

  const unlockableSeeds: string[] = [];
  const notUnlockableSeeds: string[] = [];

  minigame.plantsById
    .filter((p) => !p.unlocked && !growingLockedSeeds.includes(p.key))
    .forEach((p) => {
      (parentsUnlocked(p) ? unlockableSeeds : notUnlockableSeeds).push(p.key);
    });

  // Sort using configured sort preferences
  // This occurs in getSeedStatus so the results are consistent
  // For both target identification and debug prints
  unlockableSeeds.sort(sortUnlockables);

  return {
    unlockableUpgrades,
    unlockedSeeds,
    growingLockedSeeds,
    unlockableSeeds,
    notUnlockableSeeds,
  };
};

// Track if there are no more unlockables to prevent repeated calculations
let noUnlockables = false;
let currentTarget: string | undefined;

/**
 * Determines the next prioritized target (seed or upgrade) to aim for.
 * It prioritizes unlockable seeds first (based on prior sorting), then unlockable upgrades.
 * If a target is already being pursued and is still unlockable, it persists with that target
 * to avoid disrupting ongoing mutation attempts -- helpful for plants with long growth times.
 * This persistence is currently in-memory only and resets on page refresh.
 * @returns The key (string identifier) of the next target plant or upgrade,
 *          or `undefined` if all seeds and upgrades are unlocked or no suitable target is found.
 */
export const getCurrentTarget = (): string | undefined => {
  const { unlockableSeeds, unlockableUpgrades } = getSeedStatus();
  let nextTarget: string | undefined;

  if (unlockableSeeds.length > 0) {
    noUnlockables = false;
    nextTarget = unlockableSeeds[0];
  } else if (unlockableUpgrades.length > 0) {
    noUnlockables = false;
    nextTarget = unlockableUpgrades[0]; // First available upgrade (order based on GARDEN_UPGRADES)
  } else {
    if (!noUnlockables) {
      noUnlockables = true;
    }
    nextTarget = undefined;
  }

  // Logic to prevent switching targets prematurely:
  // If we have a potential new target (`nextTarget`),
  // but we were already working on a target (`currentTarget`),
  // and that `currentTarget` is *still* in the list of unlockable seeds,
  // then stick with the `currentTarget`.
  if (
    nextTarget !== currentTarget && // Only consider switching if the target *would* change
    currentTarget && // Only if we had a previous target
    unlockableSeeds.includes(currentTarget) // And that previous target is still valid to pursue
  ) {
    nextTarget = currentTarget; // Keep the old target
  }

  // Update the current target state in memory
  currentTarget = nextTarget;
  return currentTarget;
};

/**
 * Checks if the given target identifier corresponds to a garden upgrade drop.
 * @param target - The key (string identifier) to check.
 * @returns `true` if the target is a garden upgrade, `false` otherwise.
 */
export const isUpgradeTarget = (target: string): boolean =>
  GARDEN_UPGRADES.includes(target);

/**
 * Checks if the mutation strategy for a given target involves harvesting
 * a full garden layout simultaneously (e.g., Spore drops or Garden Upgrades).
 * For these targets, waiting for the garden plot to sync after harvest
 * can slow down the process, so replanting should happen immediately.
 * @param target - The key (string identifier) of the target plant.
 * @returns `true` if the target uses a "fullGarden" layout strategy, `false` otherwise.
 */
export const isRollingTarget = (target: string): boolean => {
  const config = MUTATION_CONFIGS[target];
  // Check if the config exists and its layout property is specifically "fullGarden"
  return !!config && config.layout === "fullGarden";
};
