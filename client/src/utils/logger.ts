import { createLogger, format, transports } from 'winston';

const { combine, timestamp, colorize, printf, splat, label} = format;
const logger = createLogger({
  format: combine(
    timestamp(),
    colorize(),
    splat(),
    label({ label: "fs-client" }),
    printf(log => `${log.timestamp} [${log.level} - ${log.label}]: ${log.message}`)
  ),
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === "production" ? "info" : "debug"
    })
  ],
  exitOnError: false,
});

export default logger;
