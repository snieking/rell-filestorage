import { createLogger, format, transports } from "winston";

const { combine, timestamp, colorize, printf, splat, label } = format;
const logger = createLogger({
  exitOnError: false,
  format: combine(
    timestamp(),
    colorize(),
    splat(),
    label({ label: "fs-client" }),
    printf(log => `${log.timestamp} [${log.label} - ${log.level}]: ${log.message}`)
  ),
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === "production" ? "info" : "debug"
    })
  ]
});

export default logger;
