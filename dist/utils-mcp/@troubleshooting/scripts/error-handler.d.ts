import { BaseError, ErrorHandler as ErrorHandlerType, ErrorHandlerConfig, ErrorHandlerBase } from "./error-types";
export declare class ErrorHandler implements ErrorHandlerType, ErrorHandlerBase {
    protected readonly config: ErrorHandlerConfig;
    protected readonly logDir: string;
    private readonly errorDocsPath;
    private readonly errorLogsPath;
    private readonly errorCache;
    private readonly templates;
    private lastProcessedFile;
    constructor(config?: ErrorHandlerConfig, logDir?: string, errorDocsPath?: string, errorLogsPath?: string);
    private initializeLogDirectory;
    handleError(error: BaseError): Promise<void>;
    protected logError(error: BaseError): Promise<void>;
    protected notifyError(error: BaseError): Promise<void>;
    private attemptAutoFix;
    private verifyRecovery;
    private executeFixScript;
    private errorCases;
    private setupPaths;
    private setupErrorWatcher;
    private initializeErrorDocs;
    private compileFigmaPlugin;
    private loadErrorCache;
    private saveErrorCache;
    setConfig(config: ErrorHandlerConfig): void;
    private determineSeverity;
    private createLogEntry;
    private updateErrorDoc;
    private updateCategoryDoc;
    private documentNewError;
    private isFigmaError;
    /**
     * 마지막으로 처리한 파일 경로 반환
     */
    getLastProcessedFile(): string | null;
    private findMatchingTemplate;
    private calculateMatchScore;
    private handleValidationError;
    private categorizeValidationError;
    private handleNetworkError;
    private checkNetworkStatus;
    private checkCurrentState;
    private isErrorState;
    private fixTypeError;
    private fixPropError;
    private fixSyntaxError;
}
export declare const errorHandler: ErrorHandler;
