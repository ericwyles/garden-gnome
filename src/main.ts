import Logger from "./logger.js";

import init from "./init.js";
// Placeholders:
// import load from './load.js';
// import save from './save.js';

import "./devHelpers";

Logger.setLevel("info");

const GardenGnome = {
  init,
  // load,
  // save,
};

if (typeof Steam !== "undefined") {
  // Need to add a delay for steam
  setTimeout(() => {
    Game.registerMod("GardenGnome", GardenGnome);
  }, 2000);
} else {
  Game.registerMod("GardenGnome", GardenGnome);
}
