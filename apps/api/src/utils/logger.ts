/**
 * Simple logger (peut être remplacé par pino/winston en production)
 */
export const logger = {
  info: (msg: unknown, ...args: unknown[]) => {
    console.log(new Date().toISOString(), "[INFO]", msg, ...args);
  },
  error: (msg: unknown, ...args: unknown[]) => {
    console.error(new Date().toISOString(), "[ERROR]", msg, ...args);
  },
  warn: (msg: unknown, ...args: unknown[]) => {
    console.warn(new Date().toISOString(), "[WARN]", msg, ...args);
  },
  debug: (msg: unknown, ...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(new Date().toISOString(), "[DEBUG]", msg, ...args);
    }
  },
};
