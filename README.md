# Garden Gnome - Cookie Clicker Garden Automator

## Overview

Garden Gnome automates the [Cookie Clicker](https://orteil.dashnet.org/cookieclicker/) Garden minigame. It strategically plants and harvests crops to unlock all garden seeds and associated upgrades efficiently, using optimized mutation layouts and prioritization.

The mod executes after each garden tick, making decisions about soil selection, planting, and harvesting. There is no UI integration. See **Current Gaps & Limitations** for details on what it doesn't do.

Works on all Garden Levels. Can unlock the full seed log starting from Garden Level 3, when the layouts for Juicy Queenbeet and Everdaisy become viable.

## Key Features

- **Automated Targeting:** Identifies the next seed or upgrade based on viable options and predefined priorities.
- **Strategic Planting:** Uses layouts optimized for single-parent and multi-parent mutations, following the wiki's [Mutation Setups](https://cookieclicker.fandom.com/wiki/Garden#Mutation_Setups). Layouts adjust dynamically to garden level.
- **Synchronized Growth:** Synchronizes planting times so parent plants mature together, maximizing mutation windows. Handles two-parent setups with different growth times. Skips synchronization for rolling strategies (Crumbspore, Brown Mold, upgrade drops).
- **Frenzy-Aware Planting:** Defers planting during CPS buffs to avoid inflated costs.
- **Harvesting & Pruning:**
  - Harvests mature plants when targeting garden upgrade drops.
  - Harvests Queenbeets and Bakeberries one tick before decay to capture cookie drops.
  - Lets Meddleweed live to one tick before decay when unlocking Crumbspore or Brown Mold.
  - Removes incorrectly planted crops that don't match the current strategy.
  - Maintains only the single oldest instance of each locked species growing.
  - Clears and restarts mutation attempts when plant decay makes new mutations impossible (one-parent mutations only). Considers all possible mutations before clearing.
- **Soil Optimization:** Switches between Fertilizer (faster growth) and Wood Chips (better mutation odds) based on plant maturity.
- **Auto Sacrifice:** Sacrifices garden after all seeds and upgrades are unlocked for 10 sugar lumps, then continues the cycle.

## Unlock Performance

Performance measured using the [Garden Gnome Runner](https://github.com/bdunks/garden-gnome-runner), which simulates garden minigame ticks in a loop. Statistics based on 1,000 runs from garden reset to full seed log unlock on a Level 9+ plot (6x6), representing approximately 16 simulated years:

| Statistic  | Time to Unlock |
| :--------- | :------------- |
| **Mean**   | 5 days, 17 hrs |
| **Median** | 5 days, 1 hr   |
| **Min**    | 2 days, 23 hrs |
| **Max**    | 17 days, 5 hrs |

| ![Image of a Histogram showing the distribution of runtimes for 1000 Runs](unlock-histogram.png) |
| :----------------------------------------------------------------------------------------------: |
|                                   _Histogram of 1000 runtimes_                                   |

Runtime variability depends heavily on Juicy Queenbeet unlock probability.

The Wiki's [Grinding Sugar Lumps](https://cookieclicker.fandom.com/wiki/Garden#Grinding_Sugar_lumps) strategy suggests completion in around 5.5 days using advanced techniques like plot splitting (attempting two mutations simultaneously on larger plots). This mod attempts only one mutation at a time to reduce complexity, and achieves the same unlock velocity.

**Smaller Gardens:** Level 3 (3x3) with only Fertilizer (<300 Farm buildings) typically takes 3-6 weeks. With Wood Chips unlocked, 2-3 weeks is typical.

## Current Gaps & Limitations

- **No UI/Config:** No UI integration, alerts, or configuration options.
- **Two-Parent Mutation Restart:** Waits for full decay before restarting two-parent mutations. Does not check each tick if mutation is still possible. Single-parent mutations are optimized, but the additional complexity to implement in two-parent mutations wasn't worth the small benefit.
- **No State Persistence:** Current target is remembered in-memory but cleared on page refresh.
- **No Cookie Balance Checking:** Continues planting attempts regardless of cookie balance, which may result in incomplete layouts.

## How to Run

### Bookmarklet

Copy this code and save it as a bookmark. Paste it in the URL section. Click the bookmark when the game is open to activate.

```javascript
javascript: (function () {
  Game.LoadMod("https://bdunks.github.io/garden-gnome/gardenGnome.js");
})();
```

### Userscript

For automatic loading, use a [userscript](https://en.wikipedia.org/wiki/Userscript) manager (Tampermonkey or Greasemonkey). Install `gardenGnome.user.js` from this repository. In Tampermonkey, navigate to the file in the GitHub file list, click "Raw", and it should offer to install.

## Cheat Discussion

Is this a cheat mod? That's in the eye of the beholder. This mod respects all constraints of the game (e.g., cookie costs, soil switch timeouts, etc.). I could classify it as an advanced auto clicker, or like hiring an little gnome that tends to my garden 24x7.
## Status & Contributions

This mod is provided **as-is**. Tested extensively using the [Garden Gnome Runner Tool](https://github.com/bdunks/garden-gnome-runner/) and in-game over several months.

Garden Gnome is **feature complete** for its main goal: unlocking seeds and upgrades.

I will try my best to respond to issues and requests, but please remember this is a hobby-project, so it may take a bit of time.

- **Pull Requests:** Well-documented PRs are welcome. Review timing may vary.
- **Bug Reports:** Accepted. Response time may vary.

## Development Lifecycle

To run and test locally:

- Run `npm run dev`
- Add the dev userscript (`./userscripts/gardenGnome.user.dev.js`) to your userscript manager (e.g., Tampermonkey).
  - Template assumes locally hosted [Garden Gnome Runner Tool](https://github.com/bdunks/garden-gnome-runner/) on port `5173` and this mod on port `8080`.
- Refresh Cookie Clicker (or Garden Gnome Runner) after making changes.

**Note on `npm run dev`:**

Vite does not directly serve `./gardenGnome.js` from its dev server. The userscript requires access to a complete `.js` file to load the mod.

## Acknowledgements

Thanks to the [**CookieMonsterTeam**](https://github.com/CookieMonsterTeam/CookieMonster) for providing a project structure template and garden tick logic reference.
