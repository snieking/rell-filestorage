import { createLogger, format, transports } from 'winston';

const level = process.env.REACT_APP_FS_LOG_LEVEL;

const { combine, timestamp, colorize, printf } = format;
const logger = createLogger({
  format: combine(
    timestamp(),
    colorize(),
    printf(log => `${log.timestamp} [${log.level}]: ${log.message}`)
  ),
  transports: [
    new transports.Console({
      level: level != undefined ? level : "info"
    })
  ],
  exitOnError: false,
});

export default logger;
