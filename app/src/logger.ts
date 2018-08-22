import { Logger, LogLevel, RootLogger } from 'matris-logger';

const level = process.env.LOG_LEVEL as LogLevel || 'info';

// Configure logging
const rootLogger = new RootLogger({level});

/**
 * Returns a Logger for logging
 * @param {string} name: Logger name or file path
 * @param {string[]} labels: Additional labels for log
 * @returns {Logger}
 */
const getLogger = (name: string, labels: string[] = []): Logger => rootLogger.getLogger(name, labels);

export { getLogger, Logger, LogLevel };
