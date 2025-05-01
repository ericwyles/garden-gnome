import { MutationConfig, LayoutRegistry } from "./types/gardenGnome";

// -- Mutation Data -----------------------------------------------------------
export const MUTATION_CONFIGS: Record<string, MutationConfig> = {
  // bakerWheat: { parents: ["bakerWheat"], layout: "oneParent" }, // STARTS unlocked ... included for completeness
  thumbcorn: { parents: ["bakerWheat"], layout: "oneParent" },
  bakeberry: { parents: ["bakerWheat"], layout: "oneParent" },
  duketater: { parents: ["queenbeet"], layout: "oneParent" },
  whiteMildew: { parents: ["brownMold"], layout: "oneParent" },
  nursetulip: { parents: ["whiskerbloom"], layout: "oneParent" },
  doughshroom: { parents: ["crumbspore"], layout: "oneParent" },

  // Not planted: Grows spontaneously. Managed through special handling in `process plot`
  // meddleweed: { parents: ["meddleweed"], layout: "oneParent" }, // SPECIAL HANDLING
  // Meddleweed can of course sponaneously grow, and will replicate with open spots, but we're going for speed over cost.
  crumbspore: { parents: ["meddleweed"], layout: "fullGarden" },
  brownMold: { parents: ["meddleweed"], layout: "fullGarden" },

  // The second plant is the one with no-or-lower probability of unwanted single-plant mutation.
  // These are planted in the "Y"ellow tiles on this wiki guide: https://cookieclicker.fandom.com/wiki/Garden#Common_setups
  clover: { parents: ["gildmillet", "bakerWheat"], layout: "twoParent" },
  goldenClover: {
    parents: ["gildmillet", "bakerWheat"],
    layout: "twoParent",
  },
  cronerice: { parents: ["thumbcorn", "bakerWheat"], layout: "twoParent" },
  gildmillet: { parents: ["cronerice", "thumbcorn"], layout: "twoParent" },
  shimmerlily: { parents: ["clover", "gildmillet"], layout: "twoParent" },
  chocoroot: { parents: ["brownMold", "bakerWheat"], layout: "twoParent" },
  whiteChocoroot: {
    parents: ["whiteMildew", "chocoroot"],
    layout: "twoParent",
  },
  elderwort: { parents: ["shimmerlily", "cronerice"], layout: "twoParent" },
  wardlichen: { parents: ["keenmoss", "cronerice"], layout: "twoParent" },
  whiskerbloom: {
    parents: ["shimmerlily", "whiteChocoroot"],
    layout: "twoParent",
  },
  chimerose: {
    parents: ["shimmerlily", "whiskerbloom"],
    layout: "twoParent",
  },
  drowsyfern: { parents: ["keenmoss", "chocoroot"], layout: "twoParent" },
  queenbeet: { parents: ["bakeberry", "chocoroot"], layout: "twoParent" },
  tidygrass: {
    parents: ["whiteChocoroot", "bakerWheat"],
    layout: "twoParent",
  },
  glovemorel: { parents: ["crumbspore", "thumbcorn"], layout: "twoParent" },
  cheapcap: { parents: ["shimmerlily", "crumbspore"], layout: "twoParent" },
  wrinklegill: { parents: ["crumbspore", "brownMold"], layout: "twoParent" },
  ichorpuff: { parents: ["elderwort", "crumbspore"], layout: "twoParent" },
  keenmoss: { parents: ["greenRot", "brownMold"], layout: "twoParent" },
  foolBolete: { parents: ["greenRot", "doughshroom"], layout: "twoParent" },
  greenRot: { parents: ["clover", "whiteMildew"], layout: "twoParent" },

  // Specialized mutation setups per this wiki guide: https://cookieclicker.fandom.com/wiki/Garden#Mutation_Setups
  // Note that we haven't configured a layout for "Shriekbulb" becasue we expect it to be unlocked through queenbeetLump attemps
  queenbeetLump: { parents: ["queenbeet"], layout: "juicyQueenbeet" },
  shriekbulb: { parents: ["duketater"], layout: "shriekbulb" },
  everdaisy: { parents: ["tidygrass", "elderwort"], layout: "everdaisy" },

  // Garden Cookie Drops (Only triggered if they haven't been unlocked)
  // Recommend Utilizing Cosmic beginner's luck (heavenly upgrade, +400%) [https://cookieclicker.fandom.com/wiki/Garden#Obtaining_Garden_drops]
  // May require some healthy early combos and stock market
  "Elderwort biscuits": { parents: ["elderwort"], layout: "fullGarden" },
  "Bakeberry cookies": { parents: ["bakeberry"], layout: "fullGarden" },
  "Duketater cookies": { parents: ["duketater"], layout: "fullGarden" },
  "Green yeast digestives": { parents: ["greenRot"], layout: "fullGarden" },
  "Wheat slims": { parents: ["bakerWheat"], layout: "fullGarden" },
  "Fern tea": { parents: ["drowsyfern"], layout: "fullGarden" },
  "Ichor syrup": { parents: ["ichorpuff"], layout: "fullGarden" },
};

// Put in a subjective order for usefulness, starting with Drops -> Lumps -> CPS
export const GARDEN_UPGRADES = [
  "Green yeast digestives",
  "Ichor syrup",
  "Duketater cookies",
  "Elderwort biscuits",
  "Bakeberry cookies",
  "Wheat slims",
  "Fern tea",
];

// -- Garden Level to Garden Size Registries -------------------------------------------------------
export const LEVEL_TO_SIZE: Record<number, string> = {
  1: "2x2",
  2: "3x2",
  3: "3x3",
  4: "4x3",
  5: "4x4",
  6: "5x4",
  7: "5x5",
  8: "6x5",
  9: "6x6",
};

// -- Layout Registries -------------------------------------------------------
// Layouts are keyed by garden dimensions.
// With the exception of juicyQueenbeet, these are coded from left-to-right, top-to-bottom.
// By convension, there is an extra space betweeb each new "y" (or "row") for readibility, except in very simple layouts.
export const LAYOUTS: LayoutRegistry = {
  oneParent: {
    // 2x2
    1: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ],
    // 3x2
    2: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ],
    // 3x3
    3: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    // 4x3
    4: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    // 4x4
    5: [
      { x: 0, y: 0 },
      { x: 3, y: 0 },

      { x: 2, y: 1 },

      { x: 1, y: 2 },

      { x: 0, y: 3 },
      { x: 3, y: 3 },
    ],
    // 5x4
    6: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },

      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ],
    // 5x5
    7: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },

      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ],
    // 6x5
    8: [
      { x: 1, y: 0 },
      { x: 4, y: 0 },

      { x: 1, y: 1 },
      { x: 4, y: 1 },

      { x: 1, y: 3 },
      { x: 4, y: 3 },

      { x: 1, y: 4 },
      { x: 4, y: 4 },
    ],
    // 6x6
    9: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 5, y: 1 },

      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
    ],
  },
  twoParent: {
    // 2x2
    1: [
      { x: 0, y: 0, parent: 1 },
      { x: 1, y: 0, parent: 0 },
    ],
    // 3x2
    2: [
      { x: 1, y: 0, parent: 0 },
      { x: 1, y: 1, parent: 1 },
    ],
    // 3x3
    3: [
      { x: 0, y: 1, parent: 0 },
      { x: 1, y: 1, parent: 1 },
      { x: 2, y: 1, parent: 0 },
    ],
    // 4x3
    4: [
      { x: 0, y: 1, parent: 1 },
      { x: 1, y: 1, parent: 0 },
      { x: 2, y: 1, parent: 0 },
      { x: 3, y: 1, parent: 1 },
    ],
    // 4x4 -- The center 2x2 has been flipped from the one parent layout;
    // However, we are respecting the wiki guide exactly.
    5: [
      { x: 0, y: 0, parent: 1 },
      { x: 3, y: 0, parent: 1 },

      { x: 1, y: 1, parent: 0 },

      { x: 2, y: 2, parent: 0 },

      { x: 0, y: 3, parent: 1 },
      { x: 3, y: 3, parent: 1 },
    ],
    // 5x4
    6: [
      { x: 0, y: 0, parent: 1 },
      { x: 2, y: 0, parent: 0 },
      { x: 4, y: 0, parent: 1 },

      { x: 1, y: 2, parent: 0 },
      { x: 3, y: 2, parent: 1 },
      { x: 4, y: 2, parent: 0 },

      { x: 0, y: 3, parent: 1 },
    ],
    // 5x5
    7: [
      { x: 0, y: 0, parent: 1 },
      { x: 1, y: 0, parent: 0 },
      { x: 3, y: 0, parent: 1 },
      { x: 4, y: 0, parent: 0 },

      { x: 0, y: 2, parent: 1 },
      { x: 1, y: 2, parent: 0 },
      { x: 3, y: 2, parent: 1 },
      { x: 4, y: 2, parent: 0 },
    ],
    // 6x5
    8: [
      { x: 1, y: 0, parent: 0 },
      { x: 4, y: 0, parent: 0 },

      { x: 1, y: 1, parent: 1 },
      { x: 4, y: 1, parent: 1 },

      { x: 1, y: 3, parent: 0 },
      { x: 4, y: 3, parent: 0 },

      { x: 1, y: 4, parent: 1 },
      { x: 4, y: 4, parent: 1 },
    ],
    // 6x6
    9: [
      { x: 0, y: 1, parent: 0 },
      { x: 1, y: 1, parent: 1 },
      { x: 2, y: 1, parent: 0 },
      { x: 4, y: 1, parent: 1 },
      { x: 5, y: 1, parent: 0 },

      { x: 0, y: 4, parent: 0 },
      { x: 1, y: 4, parent: 1 },
      { x: 3, y: 4, parent: 0 },
      { x: 4, y: 4, parent: 1 },
      { x: 5, y: 4, parent: 0 },
    ],
  },
  juicyQueenbeet: {
    // No valid Level 1 & 2 Layouts
    // These are codified in "rings" vs. "row-by-row"
    // 3x3
    3: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    // 4x3
    4: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    // 4x4
    5: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    // 5x4
    6: [
      // Base ring
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      // Ring 2 As Extension
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ],
    // 5x5
    7: [
      // Base ring
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      // Ring 2 As Extension
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      // Ring 3 As Extension
      { x: 0, y: 3 },
      { x: 2, y: 3 },
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      // Ring 3 As Extension
      { x: 4, y: 3 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
    ],
    // 6x5
    8: [
      // Ring 1
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      // Ring 2
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 0 },
      { x: 4, y: 2 },
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      // Ring 3 As Extension
      { x: 0, y: 3 },
      { x: 2, y: 3 },
      { x: 0, y: 4 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      // Ring 4 As Extension
      { x: 3, y: 3 },
      { x: 5, y: 3 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
    ],
    // 6x6
    9: [
      // Ring 1 -> 4 starting top left clockwise
      // Ring 1
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      // Ring 2
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 0 },
      { x: 4, y: 2 },
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      // Ring 3
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 0, y: 5 },
      { x: 1, y: 3 },
      { x: 1, y: 5 },
      { x: 2, y: 3 },
      { x: 2, y: 4 },
      { x: 2, y: 5 },
      // Ring 4
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 3, y: 5 },
      { x: 4, y: 3 },
      { x: 4, y: 5 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
      { x: 5, y: 5 },
    ],
  },
  everdaisy: {
    // No valid Level 1 & 2 Layouts
    // 3x3
    3: [
      { x: 0, y: 0, parent: 0 },
      { x: 1, y: 0, parent: 0 },
      { x: 2, y: 0, parent: 0 },

      { x: 0, y: 1, parent: 0 },
      { x: 2, y: 1, parent: 0 },

      { x: 0, y: 2, parent: 1 },
      { x: 1, y: 2, parent: 1 },
      { x: 2, y: 2, parent: 1 },
    ],
    // 4x3
    4: [
      { x: 0, y: 0, parent: 0 },
      { x: 1, y: 0, parent: 0 },
      { x: 2, y: 0, parent: 0 },
      { x: 3, y: 0, parent: 0 },

      { x: 0, y: 1, parent: 0 },
      { x: 3, y: 1, parent: 0 },

      { x: 0, y: 2, parent: 1 },
      { x: 1, y: 2, parent: 1 },
      { x: 2, y: 2, parent: 1 },
      { x: 3, y: 2, parent: 1 },
    ],
    // 4x4
    5: [
      { x: 0, y: 0, parent: 1 },
      { x: 1, y: 0, parent: 1 },
      { x: 2, y: 0, parent: 1 },
      { x: 3, y: 0, parent: 1 },

      { x: 0, y: 1, parent: 0 },
      { x: 3, y: 1, parent: 0 },

      { x: 0, y: 2, parent: 0 },
      { x: 1, y: 2, parent: 0 },
      { x: 3, y: 2, parent: 0 },

      { x: 0, y: 3, parent: 0 },
      { x: 1, y: 3, parent: 1 },
      { x: 2, y: 3, parent: 1 },
      { x: 3, y: 3, parent: 1 },
    ],
    // 5x4
    6: [
      { x: 0, y: 0, parent: 0 },
      { x: 1, y: 0, parent: 0 },
      { x: 2, y: 0, parent: 1 },
      { x: 3, y: 0, parent: 0 },
      { x: 4, y: 0, parent: 0 },

      { x: 0, y: 1, parent: 0 },
      { x: 2, y: 1, parent: 1 },
      { x: 4, y: 1, parent: 0 },

      { x: 0, y: 2, parent: 0 },
      { x: 2, y: 2, parent: 1 },
      { x: 4, y: 2, parent: 0 },

      { x: 0, y: 3, parent: 0 },
      { x: 1, y: 3, parent: 0 },
      { x: 2, y: 3, parent: 1 },
      { x: 3, y: 3, parent: 0 },
      { x: 4, y: 3, parent: 0 },
    ],
    // 5x5
    7: [
      { x: 0, y: 0, parent: 0 },
      { x: 1, y: 0, parent: 0 },
      { x: 2, y: 0, parent: 0 },
      { x: 3, y: 0, parent: 0 },
      { x: 4, y: 0, parent: 0 },

      { x: 0, y: 1, parent: 0 },
      { x: 4, y: 1, parent: 0 },

      { x: 0, y: 2, parent: 1 },
      { x: 1, y: 2, parent: 1 },
      { x: 2, y: 2, parent: 1 },
      { x: 3, y: 2, parent: 1 },
      { x: 4, y: 2, parent: 1 },

      { x: 0, y: 3, parent: 0 },
      { x: 4, y: 3, parent: 0 },

      { x: 0, y: 4, parent: 0 },
      { x: 1, y: 4, parent: 0 },
      { x: 2, y: 4, parent: 0 },
      { x: 3, y: 4, parent: 0 },
      { x: 4, y: 4, parent: 0 },
    ],
    // 6x5
    8: [
      { x: 0, y: 0, parent: 0 },
      { x: 1, y: 0, parent: 0 },
      { x: 2, y: 0, parent: 0 },
      { x: 3, y: 0, parent: 0 },
      { x: 4, y: 0, parent: 0 },
      { x: 5, y: 0, parent: 0 },

      { x: 0, y: 1, parent: 0 },
      { x: 5, y: 1, parent: 0 },

      { x: 0, y: 2, parent: 1 },
      { x: 1, y: 2, parent: 1 },
      { x: 2, y: 2, parent: 1 },
      { x: 3, y: 2, parent: 1 },
      { x: 4, y: 2, parent: 1 },
      { x: 5, y: 2, parent: 1 },

      { x: 0, y: 3, parent: 0 },
      { x: 5, y: 3, parent: 0 },

      { x: 0, y: 4, parent: 0 },
      { x: 1, y: 4, parent: 0 },
      { x: 2, y: 4, parent: 0 },
      { x: 3, y: 4, parent: 0 },
      { x: 4, y: 4, parent: 0 },
      { x: 5, y: 4, parent: 0 },
    ],
    // 6x6
    9: [
      { x: 0, y: 0, parent: 1 },
      { x: 1, y: 0, parent: 1 },
      { x: 2, y: 0, parent: 1 },
      { x: 3, y: 0, parent: 1 },
      { x: 4, y: 0, parent: 1 },
      { x: 5, y: 0, parent: 1 },

      { x: 0, y: 1, parent: 0 },
      { x: 2, y: 1, parent: 0 },
      { x: 3, y: 1, parent: 0 },
      { x: 5, y: 1, parent: 0 },

      { x: 0, y: 2, parent: 0 },
      { x: 2, y: 2, parent: 0 },
      { x: 5, y: 2, parent: 0 },

      { x: 0, y: 3, parent: 1 },
      { x: 1, y: 3, parent: 1 },
      { x: 2, y: 3, parent: 1 },
      { x: 3, y: 3, parent: 1 },
      { x: 4, y: 3, parent: 1 },
      { x: 5, y: 3, parent: 1 },

      { x: 0, y: 4, parent: 0 },
      { x: 5, y: 4, parent: 0 },

      { x: 0, y: 5, parent: 0 },
      { x: 1, y: 5, parent: 0 },
      { x: 2, y: 5, parent: 0 },
      { x: 3, y: 5, parent: 0 },
      { x: 4, y: 5, parent: 0 },
      { x: 5, y: 5, parent: 0 },
    ],
  },
  shriekbulb: {
    // 2x2
    1: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    // 3x2
    2: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ],
    // 3x3
    3: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },

      { x: 1, y: 1 },

      { x: 0, y: 2 },
      { x: 2, y: 2 },
    ],
    // 4x3
    4: [
      { x: 0, y: 0 },
      { x: 3, y: 0 },

      { x: 1, y: 1 },
      { x: 2, y: 1 },

      { x: 0, y: 2 },
      { x: 3, y: 2 },
    ],
    // 4x4
    5: [
      { x: 0, y: 0 },
      { x: 3, y: 0 },

      { x: 1, y: 1 },
      { x: 2, y: 1 },

      { x: 1, y: 2 },
      { x: 2, y: 2 },

      { x: 0, y: 3 },
      { x: 3, y: 3 },
    ],
    // 5x4
    6: [
      { x: 1, y: 0 },
      { x: 3, y: 0 },

      { x: 3, y: 1 },
      { x: 4, y: 1 },

      { x: 0, y: 2 },
      { x: 1, y: 2 },

      { x: 1, y: 3 },
      { x: 3, y: 3 },
    ],
    // 5x5
    7: [
      { x: 2, y: 0 },

      { x: 0, y: 1 },
      { x: 2, y: 1 },
      { x: 4, y: 1 },

      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },

      { x: 1, y: 4 },
      { x: 3, y: 4 },
    ],
    // 6x5
    8: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },

      { x: 1, y: 1 },
      { x: 4, y: 1 },

      { x: 1, y: 2 },
      { x: 4, y: 2 },

      { x: 1, y: 3 },
      { x: 4, y: 3 },

      { x: 0, y: 4 },
      { x: 2, y: 4 },
      { x: 4, y: 4 },
    ],
    // 6x6
    9: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },

      { x: 1, y: 1 },
      { x: 4, y: 1 },

      { x: 1, y: 2 },
      { x: 4, y: 2 },

      { x: 1, y: 3 },
      { x: 4, y: 3 },

      { x: 1, y: 4 },
      { x: 4, y: 4 },

      { x: 0, y: 5 },
      { x: 2, y: 5 },
      { x: 4, y: 5 },
    ],
  },
  _template: {
    9: [
      { x: 0, y: 0, parent: 0 },
      { x: 1, y: 0, parent: 0 },
      { x: 2, y: 0, parent: 0 },
      { x: 3, y: 0, parent: 0 },
      { x: 4, y: 0, parent: 0 },
      { x: 5, y: 0, parent: 0 },
      { x: 0, y: 1, parent: 0 },
      { x: 1, y: 1, parent: 0 },
      { x: 2, y: 1, parent: 0 },
      { x: 3, y: 1, parent: 0 },
      { x: 4, y: 1, parent: 0 },
      { x: 5, y: 1, parent: 0 },
      { x: 0, y: 2, parent: 0 },
      { x: 1, y: 2, parent: 0 },
      { x: 2, y: 2, parent: 0 },
      { x: 3, y: 2, parent: 0 },
      { x: 4, y: 2, parent: 0 },
      { x: 5, y: 2, parent: 0 },
      { x: 0, y: 3, parent: 0 },
      { x: 1, y: 3, parent: 0 },
      { x: 2, y: 3, parent: 0 },
      { x: 3, y: 3, parent: 0 },
      { x: 4, y: 3, parent: 0 },
      { x: 5, y: 3, parent: 0 },
      { x: 0, y: 4, parent: 0 },
      { x: 1, y: 4, parent: 0 },
      { x: 2, y: 4, parent: 0 },
      { x: 3, y: 4, parent: 0 },
      { x: 4, y: 4, parent: 0 },
      { x: 5, y: 4, parent: 0 },
      { x: 0, y: 5, parent: 0 },
      { x: 1, y: 5, parent: 0 },
      { x: 2, y: 5, parent: 0 },
      { x: 3, y: 5, parent: 0 },
      { x: 4, y: 5, parent: 0 },
      { x: 5, y: 5, parent: 0 },
    ],
  },
  fullGarden: {},
};

// --- Dynamic fullGarden Layout Generation ---
// This block automatically generates the "fullGarden" layout configurations for all possible garden levels (1 through 9).
// It iterates through the defined garden sizes for each level, creating a layout config
// that includes a tile for every single plot coordinate available at that level.
// This avoids manually defining the full layout for each size.
Object.values(LEVEL_TO_SIZE).forEach((size, index) => {
  const [cols, rows] = size.split("x").map(Number);
  const level = index + 1;
  LAYOUTS.fullGarden[level] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      LAYOUTS.fullGarden[level].push({ x, y });
    }
  }
});

export const STAGE = {
  bud: 1,
  sprout: 2,
  bloom: 3,
  mature: 4,
};

export const SOIL = {
  dirt: 0,
  fertilizer: 1,
  clay: 2,
  pebbles: 3,
  woodchips: 4,
};
