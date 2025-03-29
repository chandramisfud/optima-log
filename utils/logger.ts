// utils/logger.ts

import pino from "pino";
import path from "path";

// Client-side logger (uses console.log)
const clientLogger = {
  emergency: (...args: any[]) => console.error("[EMERGENCY]", ...args),
  alert: (...args: any[]) => console.error("[ALERT]", ...args),
  critical: (...args: any[]) => console.error("[CRITICAL]", ...args),
  error: (...args: any[]) => console.error("[ERROR]", ...args),
  warning: (...args: any[]) => console.warn("[WARNING]", ...args),
  notice: (...args: any[]) => console.log("[NOTICE]", ...args),
  info: (...args: any[]) => console.log("[INFO]", ...args),
  debug: (...args: any[]) => console.log("[DEBUG]", ...args),
};

// Export a function to get the server-side logger (loaded dynamically)
export const getServerLogger = async () => {
  const pino = (await import("pino")).default;

  return pino({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      targets: [
        {
          target: "pino/file",
          options: {
            destination: path.join(process.cwd(), "logs", "app.log"),
            mkdir: true,
          },
          level: process.env.NODE_ENV === "production" ? "info" : "debug",
        },
        {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:mm:ss",
          },
          level: process.env.NODE_ENV === "production" ? "info" : "debug",
        },
      ],
    },
  });
};

// Export the client logger by default
export default clientLogger;