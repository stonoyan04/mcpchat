/**
 * Logger utility for consistent logging across the application
 */

import { LogLevel, Environment } from '../enums/index.js';

export { LogLevel };

class Logger {
  private level: LogLevel;
  private isServer: boolean;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.isServer = typeof (globalThis as any).window === 'undefined';
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log(LogLevel.DEBUG, message, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      this.log(LogLevel.INFO, message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      this.log(LogLevel.WARN, message, ...args);
    }
  }

  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      this.log(LogLevel.ERROR, message, error, ...args);
    }
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const prefix = `[${timestamp}] [${levelName}]`;

    if (this.isServer) {
      // Server-side logging to stderr for errors, stdout for others
      // eslint-disable-next-line no-console
      const output = level === LogLevel.ERROR ? console.error : console.log;
      output(prefix, message, ...args);
    } else {
      // Client-side logging with appropriate console method
      const method = level === LogLevel.ERROR ? 'error' : level === LogLevel.WARN ? 'warn' : 'log';
      // eslint-disable-next-line no-console
      console[method](prefix, message, ...args);
    }
  }
}

// Export singleton instance
export const logger = new Logger(
  process.env.NODE_ENV === Environment.DEVELOPMENT ? LogLevel.DEBUG : LogLevel.INFO
);

export default logger;
