import { createLogger, format, transports } from 'winston';

const { combine, timestamp, colorize, printf } = format;
const logger = createLogger({
  format: combine(
    timestamp(),
    colorize(),
    printf(log => `${log.timestamp} [${log.level}]: ${log.message}`)
  ),
  transports: [
    new transports.Console()
  ],
  exitOnError: false,
});

export default logger;
