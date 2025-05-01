/* eslint-disable no-console */
enum LogLevel {
  error = 0,
  warn = 1,
  info = 2,
  debug = 3,
}

export default class Logger {
  private static currentLevel: LogLevel = LogLevel.info;

  private static readonly prefix = "[Garden Gnome]";

  private static log(level: keyof typeof LogLevel, ...args: unknown[]): void {
    if (LogLevel[level] <= Logger.currentLevel) {
      const timestamp = new Date().toISOString();
      // Use the specific console method if available
      if (typeof console[level] === "function") {
        console[level](`${Logger.prefix} ${timestamp} -`, ...args);
      } else {
        console.log(`${Logger.prefix} ${timestamp} -`, ...args);
      }
    }
  }

  public static setLevel(level: keyof typeof LogLevel): void {
    if (LogLevel[level] !== undefined) {
      Logger.currentLevel = LogLevel[level];
    }
  }

  public static error(...args: unknown[]): void {
    Logger.log("error", ...args);
  }

  public static warn(...args: unknown[]): void {
    Logger.log("warn", ...args);
  }

  public static info(...args: unknown[]): void {
    Logger.log("info", ...args);
  }

  public static debug(...args: unknown[]): void {
    Logger.log("debug", ...args);
  }
}
