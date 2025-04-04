import { ErrorCase } from "../types/error-types";
export declare class ErrorLogger {
    private logPath;
    private errorStats;
    constructor(logPath: string);
    private loadStats;
    private saveStats;
    logError(error: Error, errorCase: ErrorCase): void;
    markErrorAsFixed(errorId: string): void;
    private updateSummary;
    private getErrorCase;
    getErrorStats(): Map<string, {
        count: number;
        lastOccurrence: string;
        fixed: boolean;
    }>;
}
