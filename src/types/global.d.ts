declare global {
  interface Window {
    Game: GameObject;
    Beautify: (num: number, decimalPlaces?: number) => string;
    l: <T extends HTMLElement = HTMLElement>(id: string) => T | null;
    printTargetCost: (target: string) => void;
    printLockedPlants: () => void;
    printRunDuration: () => void;
    getSeedStatus: () => {
      unlockableUpgrades: string[];
      unlockedSeeds: string[];
      unlockableSeeds: string[];
      notUnlockableSeeds: string[];
      growingLockedSeeds: string[];
    };
    averageChoresTime: number;
    unsafeWindow: typeof window;
  }

  const Game: GameObject;
  const Beautify: (num: number, decimalPlaces?: number) => string;
  const unsafeWindow: any;
  function l<T extends HTMLElement = HTMLElement>(id: string): T | null;
  const Steam: any;

  interface GameObject {
    Objects: Record<string, GameBuilding>;
    ready: boolean;
    resets: number;
    cookiesPs: number;
    unbuffedCps: number;
    auraMult: (aura: string) => number;
    Has: (thing: string) => boolean;
    HasUnlocked: (what: string) => number;
    registerMod: (id: string, mod: Record<string, () => void>) => void;
    registerHook: (id: string, hook: () => void) => void;
  }

  interface GameBuilding {
    minigame: Minigame;
    amount: number;
    level: number;
  }

  interface Minigame {
    parent: GameBuilding;
    plot: Array<Array<[number, number]>>;
    plants: Record<string, GamePlant>;
    plantsById: GamePlant[];
    plantsN: number;
    plantsUnlockedN: number;
    soilsById: GameSoil[];
    soil: number;
    nextSoil: number;
    freeze: boolean;
    toCompute: boolean;
    plotBoost: number[][][];
    plotLimits: Array<[number, number, number, number]>;
    nextStep: number;
    getCost: (plant: GamePlant) => number;
    useTool: (plantId: number, x: number, y: number) => void;
    harvest: (x: number, y: number) => void;
    convert: () => void;
    computeStepT: () => void;
    getMuts: (
      neighs: Record<string, number>,
      neighsM: Record<string, number>
    ) => string[];
  }

  interface GamePlant {
    id: number;
    key: string;
    unlocked: number;
    mature: number;
    ageTick: number;
    ageTickR: number;
    immortal?: number;
  }

  interface GameSoil {
    id: number;
    req: number;
  }
}

export {};
