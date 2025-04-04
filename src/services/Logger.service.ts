import winston from "winston";
import { injectable } from "inversify";

@injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: "info", // Set default log level to 'info'
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Log in JSON format for structured logs
      ),
      transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
      ],
    });
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}
