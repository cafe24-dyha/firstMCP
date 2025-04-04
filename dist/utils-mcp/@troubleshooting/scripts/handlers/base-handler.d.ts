import { BaseErrorCase, ErrorContext, ErrorDocument, ErrorFix, ErrorStats } from "../types/error-base";
export declare abstract class BaseErrorHandler {
    protected errorCases: Map<string, BaseErrorCase>;
    protected errorFixes: Map<string, ErrorFix>;
    protected errorStats: ErrorStats;
    protected docsPath: string;
    constructor(docsPath: string);
    abstract identifyError(error: Error): BaseErrorCase | null;
    abstract validateFix(error: Error, fix: ErrorFix): Promise<boolean>;
    protected abstract generateErrorContext(error: Error): ErrorContext;
    handleError(error: Error): Promise<void>;
    protected createErrorDocument(errorCase: BaseErrorCase, error: Error, context: ErrorContext): Promise<ErrorDocument>;
    protected logError(document: ErrorDocument): Promise<void>;
    protected formatErrorDocument(document: ErrorDocument): string;
    protected updateStats(document: ErrorDocument): void;
    protected updateErrorDocument(document: ErrorDocument): Promise<void>;
    registerErrorCase(errorCase: BaseErrorCase): void;
    registerErrorFix(fix: ErrorFix): void;
    getErrorStats(): ErrorStats;
}
