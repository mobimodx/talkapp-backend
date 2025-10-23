export declare enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG"
}
declare class Logger {
    private getTimestamp;
    private formatMessage;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, error?: Error | any, meta?: any): void;
    debug(message: string, meta?: any): void;
}
declare const _default: Logger;
export default _default;
//# sourceMappingURL=logger.d.ts.map