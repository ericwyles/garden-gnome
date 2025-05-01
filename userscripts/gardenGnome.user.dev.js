// ==UserScript==
// @name         Garden Gnome - Dev for Garden Gnome Runner
// @description  Automate common garden tasks.
// @match        http://localhost:5173/
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
    Game.LoadMod("http://localhost:8081/gardenGnome.js");
    clearInterval(readyCheck);
  }
}, 1000);
