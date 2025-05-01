import { minigame } from "./utils";
import { STAGE } from "./data";

/**
 * Determines the growth stage of a plant based on its age relative to its maturation time.
 * Stages are Sprout, Bud, Bloom, and Mature.
 * @param plant - The GamePlant object representing the plant type.
 * @param age - The current age of the plant instance in garden ticks.
 * @returns The calculated growth stage (STAGE enum value).
 */
export const getStage = (plant: GamePlant, age: number) => {
  if (age >= plant.mature) return STAGE.mature;
  if (age >= plant.mature * 0.666) return STAGE.bloom;
  if (age >= plant.mature * 0.333) return STAGE.bud;
  return STAGE.sprout;
};

/**
 * Retrieves information about the plant currently occupying a specific tile in the garden.
 * It fetches the plant type, its current age, and calculates its growth stage.
 *
 * @param x - The horizontal coordinate (column index) of the tile (0-indexed).
 * @param y - The vertical coordinate (row index) of the tile (0-indexed).
 * @returns An object containing:
 *  - `plant`: The GamePlant object for the plant on the tile, or `undefined` if the tile is empty.
 *  - `stage`: The calculated growth stage (STAGE enum value) of the plant, or `undefined` if the tile is empty.
 *  - `age`: The current age of the plant in garden ticks.
 */
export const getTileInfo = (x: number, y: number) => {
  const [plantIdPlusOne, age] = minigame.plot[y][x];
  const plant = minigame.plantsById[plantIdPlusOne - 1];
  let stage;
  if (plant) stage = getStage(plant, age);
  return { plant, stage, age };
};
