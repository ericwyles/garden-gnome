import Logger from "./logger";
import { getSeedStatus, calculateTargetCost } from "./mutationStrategy";

// --- Console Helper Functions ---
// These functions are attached to the window object for easy debugging
// directly from the browser's developer console.

/**
 * Calculates and formats the estimated cost of achieving a specific garden target.
 * Wraps `calculateTargetCost` and uses `Beautify` for readable output.
 * Made available globally as `window.printTargetCost`.
 *
 * @param target - The key (string name) of the plant or upgrade target.
 * @returns A beautified string representation of the calculated cost.
 */
const printTargetCost = (target: string): string =>
  Beautify(calculateTargetCost(target), 1);
window.printTargetCost = printTargetCost;

const STORAGE_KEYS = {
  START: "gardenGnomeRunStartTime",
  END: "gardenGnomeRunEndTime",
};

/**
 * Retrieves and logs the current status of garden seeds:
 * - Unlockable upgrades
 * - Locked seeds that cannot currently be unlocked
 * - Locked seeds that are currently growing
 * - Seeds that are ready to be unlocked via mutation.
 * Uses the custom Logger for output.
 * Made available globally as `window.printLockedPlants`.
 *
 * @returns {void}
 */
const printLockedPlants = (): void => {
  const {
    unlockableSeeds: unlockable,
    unlockableUpgrades,
    notUnlockableSeeds: notUnlockable,
    growingLockedSeeds: growingLockedPlants,
  } = getSeedStatus();
  Logger.info(
    `[INFO] Unlockable upgrades: ${
      unlockableUpgrades.length ? unlockableUpgrades.join(", ") : "None"
    }`
  );
  Logger.info(
    `[INFO] Locked plants: ${
      notUnlockable.length ? notUnlockable.join(", ") : "None"
    }`
  );
  Logger.info(
    `[INFO] Growing locked plants: ${
      growingLockedPlants.length ? growingLockedPlants.join(", ") : "None"
    }`
  );
  Logger.info(
    `[INFO] Unlockable plants: ${
      unlockable.length ? unlockable.join(", ") : "None"
    }`
  );
};
window.printLockedPlants = printLockedPlants;
window.getSeedStatus = getSeedStatus;

/**
 * Calculates and logs the duration of the garden gnome script's run.
 * It reads start and end timestamps from localStorage. If the end timestamp
 * isn't present, it assumes the run is still in progress and uses the current time.
 * The duration is logged in a human-readable format (days, hours, minutes, seconds).
 * Made available globally as `window.printRunDuration`.
 *
 * @returns {void}
 */
function printRunDuration(): void {
  // Get timestamps from localStorage
  const startTimeStr = localStorage.getItem(STORAGE_KEYS.START);
  // Get end time if available, otherwise use current time for "in process"
  const storedEndTime = localStorage.getItem(STORAGE_KEYS.END);
  const endTimeStr = storedEndTime || Date.now().toString();

  // Validate existence of start timestamp
  if (!startTimeStr) {
    Logger.debug("Start time missing in local storage."); // Corrected message
    return;
  }

  // Parse the stored timestamps
  const startTime = parseInt(startTimeStr, 10);
  const endTime = parseInt(endTimeStr, 10);

  // Check for parsing errors or invalid timestamps
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    Logger.debug("Invalid timestamp format in local storage.");
    return;
  }

  // Calculate time difference in milliseconds
  const diff = endTime - startTime;
  if (diff < 0) {
    // This could happen if system clock changed or localStorage was manually edited
    Logger.debug(
      "End time is earlier than start time. Check system clock or localStorage values."
    );
    return;
  }

  // Convert milliseconds to days, hours, minutes, seconds
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Build the interval string in plain English
  const parts = [];
  if (days) parts.push(days + (days === 1 ? " day" : " days"));
  if (hours) parts.push(hours + (hours === 1 ? " hour" : " hours"));
  if (minutes) parts.push(minutes + (minutes === 1 ? " minute" : " minutes"));
  if (seconds || parts.length === 0)
    parts.push(seconds + (seconds === 1 ? " second" : " seconds"));

  const runStatus = storedEndTime ? "Run completed" : "Run in process";
  Logger.debug(`${runStatus} - Time interval: ${parts.join(", ")}`);
}

window.printRunDuration = printRunDuration;
