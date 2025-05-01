// ==UserScript==
// @name         Garden Gnome
// @description  Automate common garden tasks.
// @match        https://orteil.dashnet.org/cookieclicker/*
// @icon         https://cookieclicker.wiki.gg/images/e/e5/Harvest_all.png
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==
const readyCheck = setInterval(() => {
  const Game = unsafeWindow.Game;

  if (
    typeof Game !== "undefined" &&
    typeof Game.ready !== "undefined" &&
    Game.ready
  ) {
    Game.LoadMod("https://bdunks.github.io/garden-gnome/gardenGnome.js");
    clearInterval(readyCheck);
  }
}, 1000);
