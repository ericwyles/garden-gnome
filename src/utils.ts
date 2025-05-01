// Return from a closure so it's "refreshed" every time
// eslint-disable-next-line import/prefer-default-export
export const minigame: Minigame = (() => Game.Objects?.Farm?.minigame)();
