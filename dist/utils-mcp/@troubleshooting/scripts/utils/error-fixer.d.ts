import { ErrorCase } from "../types/error-types";
export declare class ErrorFixer {
    private fixers;
    constructor();
    private initializeFixers;
    fixError(errorCase: ErrorCase, filePath: string, match: RegExpMatchArray): Promise<boolean>;
    private runCommand;
    private refreshApiToken;
    registerFixer(errorId: string, fixer: (filePath: string, match: RegExpMatchArray) => Promise<void>): void;
}
