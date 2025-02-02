import * as log from "https://deno.land/std@0.218.2/log/mod.ts";

export class LoggerManager {
  public static INSTANCE: log.Logger;
  private constructor() {
    log.setup({
      handlers: {
        console: new log.ConsoleHandler("DEBUG", {
          formatter: (record) => `[${record.levelName}] ${record.msg}`,
        }),
      },

      loggers: {
        default: {
          level: "INFO",
          handlers: ["console"],
        },
        debug: {
          level: "DEBUG",
          handlers: ["console"],
        }
      },
    });
  }

  public static getInstance(){
    if (LoggerManager.INSTANCE == null) {
      return LoggerManager.createInstance()
    }
    return LoggerManager.INSTANCE
  }

  public static createInstance(mode?: string){
    if (LoggerManager.INSTANCE == null) {
      new LoggerManager()
    } else if (LoggerManager.INSTANCE.loggerName == mode){
      return LoggerManager.INSTANCE
    }
    return LoggerManager.INSTANCE = log.getLogger(mode)
  }
}

