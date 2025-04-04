import { ErrorCase } from "./error-types";
export declare class ErrorLogger {
    private logPath;
    private errorCache;
    constructor(logPath: string);
    private initializeLogger;
    logError(error: Error, errorCase?: ErrorCase): Promise<void>;
    private updateErrorLog;
    getErrorStats(): {
        totalErrors: number;
        fixedErrors: number;
        pendingErrors: number;
        figmaErrors: number;
    };
}
