import { minigame } from "./utils";

import {
  getCurrentTarget,
  isRollingTarget,
  isUpgradeTarget,
  getSeedStatus,
} from "./mutationStrategy";

import { getLayoutConfigForTarget } from "./gardenLayout";

import {
  optimizeSoil,
  getEnhancedPlotData,
  getTicksToPlantedMaturity,
  getTicksToPlantedDecay,
  getTicksUnplantedMaturity,
} from "./garden";

import { STAGE, MUTATION_CONFIGS } from "./data";

import { PlotData, NonEmptyTile, TileStatus } from "./types/gardenGnome";
import Logger from "./logger";

/**
 * @constant {string[]} harvestBeforeDecay
 * An array of plant keys that should be harvested just before they decay (1 tick remaining).
 * This is typically used for plants that drop valuable items upon harvest, like seeds or sugar lumps,
 * maximizing the chance of getting the drop without letting the plant decay naturally.
 */
const harvestBeforeDecay = [
  "queenbeet",
  "bakeberry",
  "chocoroot",
  "whiteChocoroot",
];

/**
 * Gathers neighbor plant data for a specific tile coordinate.
 * @param plotData - The current state of the garden plot.
 * @param targetX - The x-coordinate of the tile to check neighbors for.
 * @param targetY - The y-coordinate of the tile to check neighbors for.
 * @returns An object containing counts of all neighbors and mature neighbors by species key.
 */
const getNeighborsData = (
  plotData: PlotData,
  targetX: number,
  targetY: number,
): { neighs: Record<string, number>; neighsM: Record<string, number> } => {
  const neighs: Record<string, number> = {};
  const neighsM: Record<string, number> = {};
  // Initialize counts for all known plants to avoid undefined checks later
  Object.keys(minigame.plants).forEach((key) => {
    neighs[key] = 0;
    neighsM[key] = 0;
  });

  const neighborCoords = [
    { dx: -1, dy: -1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
  ];

  neighborCoords.forEach(({ dx, dy }) => {
    const nx = targetX + dx;
    const ny = targetY + dy;

    // Find the tile in plotData (assuming plotData is flat array)
    const neighborTile = plotData.find((t) => t.x === nx && t.y === ny);

    // Check if neighborTile exists, is valid, and is not empty
    if (
      neighborTile &&
      neighborTile.status !== TileStatus.Empty &&
      neighborTile.status !== TileStatus.Invalid
    ) {
      const tile = neighborTile as NonEmptyTile; // Type assertion
      const species = tile.plant.key;
      neighs[species] += 1;
      if (tile.stage === STAGE.mature) {
        neighsM[species] += 1;
      }
    }
  });

  return { neighs, neighsM };
};

/**
 * Checks if any empty tile in the plot has the potential to spawn a new mutation.
 * @param plotData - The current state of the garden plot.
 * @returns True if at least one empty tile can potentially mutate, false otherwise.
 */
const canAnyTileMutate = (plotData: PlotData): boolean => {
  const { unlockableSeeds } = getSeedStatus();
  // Get all empty tiles
  const emptyTiles = plotData.filter((t) => t.status === TileStatus.Empty);

  const mutationPossible = emptyTiles.some((tile) => {
    const { neighs, neighsM } = getNeighborsData(plotData, tile.x, tile.y);
    // Check if there are any neighbors at all
    const anyNeighbors = Object.values(neighs).some((count) => count > 0);

    if (anyNeighbors) {
      // Use the minigame's mutation logic function
      const potentialMutations = minigame.getMuts(neighs, neighsM);
      // If mutations are found, and the seed is NOT already locked
      // return true to signal .some() to stop and return true
      return potentialMutations.some((mutation) =>
        unlockableSeeds.includes(mutation[0]),
      );
    }
    // If no neighbors or no remaining mutations for this tile, return false to continue checking others
    return false;
  });

  // The result of .some() is the final answer
  return mutationPossible;
};

/**
 * Processes the entire garden plot in one pass.
 * Handles harvesting mature or unwanted plants, pruning incorrect plants,
 * and managing locked plants (keeping only the oldest growing one per species).
 * Also includes special logic for unlocking certain plants like Crumbspore
 * and harvesting specific plants just before they decay.
 *
 * @param plotData - The current state of the garden plot with enhanced tile data.
 * @param target - The current mutation or upgrade target, used to determine harvesting strategy.
 */
const processPlot = (plotData: PlotData, target?: string) => {
  // Sacrafice the garden if all seeds are unlocked && all upgrades are unlocked (i.e., upgrade target),
  if (minigame.plantsUnlockedN === minigame.plantsN && !target) {
    minigame.convert();
    return;
  }
  // Check for mutation potential FIRST
  // This only works for single plant mutations as multi-plant mutations
  // have a lot of syncronization considerations and the implementation has been too buggy
  if (target && MUTATION_CONFIGS[target]?.parents?.length === 1) {
    const layoutFullyMature = plotData
      .filter((t): t is NonEmptyTile => t.status === TileStatus.LayoutPlanted)
      .every((t) => t.stage === STAGE.mature);

    if (layoutFullyMature && !canAnyTileMutate(plotData)) {
      Logger.debug(
        "No potential mutations and plot is not in a valid immature layout state. Harvesting entire plot.",
      );
      plotData
        .filter((t): t is NonEmptyTile => t.status === TileStatus.LayoutPlanted)
        .forEach(({ x, y }) => {
          minigame.harvest(x, y);
        });
    }
  }

  // When locked plants are growing, we want to harvest all but the oldest growing of that
  // species to keep garden space free.  This is particularly helpful when going for golden
  // clover, as the garden will get overrun by regular clover before it's unlocked the first time.
  // Build dictionary of oldest locked, not mature plants by species.
  const oldestLockedBySpecies: {
    [species: string]: { age: number; x: number; y: number };
  } = {};
  plotData
    .filter(
      (t): t is NonEmptyTile =>
        t.status === TileStatus.Locked && t.stage !== STAGE.mature,
    )
    .forEach(({ plant, age, x, y }) => {
      const species = plant.key;
      // If no candidate exists or current plant is older, update the candidate.
      if (
        !oldestLockedBySpecies[species] ||
        age > oldestLockedBySpecies[species].age
      ) {
        oldestLockedBySpecies[species] = { age, x, y };
      }
    });

  plotData
    .filter(
      (t): t is NonEmptyTile =>
        t.status !== TileStatus.Empty && t.status !== TileStatus.Invalid,
    )
    .forEach(({ plant, stage, status, ticksToDecay, x, y }) => {
      // Special handling to unlock Crumbsport and Brown Mold.  Note this also coveres locked meddleweed for very early run.
      if (
        plant.key === "meddleweed" &&
        (!minigame.plants.crumbspore.unlocked ||
          !minigame.plants.brownMold.unlocked)
      ) {
        // Wait until meddleweed is older than the threshold so that there's a 17%+ chance for crumbspore/brownMold to drop.
        if (ticksToDecay <= 1) {
          minigame.harvest(x, y);
        }
      }

      // Locked plants: harvest if mature; otherwise note growing state.
      if (status === TileStatus.Locked) {
        if (stage === STAGE.mature) {
          minigame.harvest(x, y);
          // Locked, growing plants: keep only the oldest.
        } else {
          const species = plant.key;
          const candidate = oldestLockedBySpecies[species];
          // Harvest if this is not the candidate.
          if (!(candidate.x === x && candidate.y === y)) {
            minigame.harvest(x, y);
          }
        }
      } else if (status === TileStatus.Incorrect) {
        // Unlocked plants: prune if it is not the correct plant for the tile, including if the tile should be empty
        minigame.harvest(x, y);
        // Harvest just before death for
      } else if (harvestBeforeDecay.includes(plant.key) && ticksToDecay <= 1) {
        minigame.harvest(x, y);
        // Harvest plants at mature when garden upgrade target
      } else if (target && isUpgradeTarget(target) && stage === STAGE.mature) {
        minigame.harvest(x, y);
      }
    });
};

/**
 * Determines if planting a specific plant should wait for existing plants of the same type to mature.
 * This synchronization helps ensure plants mature together for mutation setups.
 * Synchronization is ignored for "rolling" targets (like Juicy Queenbeet setups) or immortal plants.
 *
 * @param plantKey - The key of the plant species being considered for planting.
 * @param countPlanted - A record mapping plant keys to the count of currently planted instances matching the layout.
 * @param target - The current mutation or upgrade target.
 * @param isImmortal - Indicates if the plant is immortal (1) or not (undefined).
 * @returns True if planting should wait for synchronization, false otherwise.
 */
const shouldWaitForSync = (
  plantKey: string,
  plotData: PlotData,
  target: string,
  isImmortal: number | undefined,
  ticksToPlantedMaturity: number,
): boolean => {
  const alreadyPlanted = plotData.some(
    (t) => t.status === TileStatus.LayoutPlanted && t.plant.key === plantKey,
  );
  // In larger plots, the Tidygrass planted right next to the Eldewort will not plant without a buffer:
  // since it "matures faster" (due to Elderwort effects), the others plant first, so it needs a couple tick buffer
  const everdaisyBuffer =
    target === "everdaisy" && ticksToPlantedMaturity >= 78; // Standard is 80; so this gives a 2-tick buffer
  // Don't worry about syncing plots if we're trying to plant as fast as possible (garden upgrades) or plants are immortal
  const ignoreSync = isRollingTarget(target) || isImmortal;
  return alreadyPlanted && !ignoreSync && !everdaisyBuffer;
};

/**
 * Determines whether seed planting should be allowed based on current CPS buffs.
 *
 * Planting is blocked during temporary buffs (Click Frenzy, building buffs, etc.)
 * because seed costs are multiplied by the CPS multiplier, making them expensive.
 *
 * However, long-running loan buffs (Loan 1, 2, 3) and Frenzy are allowed since they
 * may be active frequently during normal gameplay. This function allows planting
 * during these buffs as long as there are no additional temporary buffs stacked on top.
 *
 * @returns True if planting should proceed, false if blocked by temporary buffs.
 */
const shouldAllowPlanting = (): boolean => {
  // No buffs active - safe to plant
  if (Game.cookiesPs <= Game.unbuffedCps) {
    return true;
  }

  // Check for active loan buffs (Loan 1, 2, or 3)
  const loanBuffs = ["Loan 1", "Loan 2", "Loan 3"];
  const activeLoan = loanBuffs.find((loanName) => Game.hasBuff(loanName));

  // Check for active Frenzy buff
  const activeFrenzy = Game.hasBuff("Frenzy");

  if (activeLoan || activeFrenzy) {
    const buffName = activeLoan || "Frenzy";
    const activeBuff = Game.buffs[buffName];
    const buffMultiplier = activeBuff?.multCpS ?? 1;

    // Allow planting if CPS is only buffed by the loan/frenzy (no additional temporary buffs)
    const expectedCps = Game.unbuffedCps * buffMultiplier;
    return Game.cookiesPs <= expectedCps;
  }

  // Other buffs are active - block planting
  return false;
};

/**
 * Plants seeds in empty tiles according to the current layout and target.
 * It attempts to synchronize planting so that plants mature around the same time,
 * crucial for mutation setups. It considers the maturity times of existing plants
 * and the decay times to decide when to plant.
 *
 * @param target - The current mutation or upgrade target.
 * @param plotData - The current state of the garden plot with enhanced tile data.
 */
const plantSeeds = (target: string, plotData: PlotData) => {
  const ticksToPlantedMaturity = getTicksToPlantedMaturity(plotData);
  const ticksToPlantedDecay = getTicksToPlantedDecay(plotData);
  const ticksToUnplantedMaturity = getTicksUnplantedMaturity(plotData);

  // For each unplanted tile, if its expected ticks are within the margin of targetTime, plant it.
  // This may be the first plant in the setup if neither are planted.
  plotData
    .filter((t): t is NonEmptyTile => t.status === TileStatus.LayoutUnplanted)
    .filter(
      (t) =>
        !shouldWaitForSync(
          t.plant.key,
          plotData,
          target,
          t.plant.immortal,
          ticksToPlantedMaturity,
        ),
    )
    .forEach((t) => {
      if (ticksToUnplantedMaturity >= ticksToPlantedMaturity) {
        // Plot is empty, only plant the longest maturing plants (i.e., those that match the plotMatruityTime)
        if (ticksToPlantedMaturity === -Infinity) {
          if (t.ticksToMature === ticksToUnplantedMaturity) {
            minigame.useTool(t.plant.id, t.x, t.y);
          }
          // At least a two tick overlap before current plants decay
        } else if (
          t.ticksToMature + 2 <= ticksToPlantedDecay &&
          t.ticksToMature >= ticksToPlantedMaturity
        ) {
          minigame.useTool(t.plant.id, t.x, t.y);
        }
      }
    });
};

/**
 * Performs the main garden management tasks in a loop.
 * Determines the current target, gets the corresponding layout, processes the plot
 * (harvesting, pruning), updates the plot data, plants seeds according to the strategy,
 * and optimizes the soil type. Planting is skipped if CPS buffs are active.
 */
const gnomeChores = (): void => {
  const target = getCurrentTarget();
  const layout = getLayoutConfigForTarget(target);

  // Get initial plot data to drive weeding, etc.
  let plotData = getEnhancedPlotData(layout, target);

  processPlot(plotData, target);

  // Update plot data after plot processing (weeding, etc).
  plotData = getEnhancedPlotData(layout, target);

  // Keep planting even if a locked plant is growing, unless it's a lump as we test a few things and we don't want to lose it.
  // Also hold off on planting if we're in the middle of a frenzy, building buff, etc.
  // Long-running loan buffs are allowed since they last for days.
  if (target && shouldAllowPlanting()) {
    plantSeeds(target, plotData);
  }

  optimizeSoil(target, plotData);
};

export default gnomeChores;
