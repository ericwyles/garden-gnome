import gnomeChores from "./gnome";
import { minigame } from "./utils";

let lastGardenNextStep = 0;

const checkGardenTick = () => {
  if (
    lastGardenNextStep !== minigame.nextStep &&
    lastGardenNextStep < Date.now()
  ) {
    lastGardenNextStep = minigame.nextStep;
    return true;
  }
  return false;
};

const logicLoopHook = () => {
  if (!minigame) return;
  if (checkGardenTick()) {
    gnomeChores();
  }
};

export default function init() {
  Game.registerHook("logic", logicLoopHook);
}
