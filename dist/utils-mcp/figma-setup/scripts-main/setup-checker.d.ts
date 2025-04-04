import { BaseErrorHandler } from "../../troubleshooting/core/handlers/base-handler";
import { BaseErrorCase, ErrorContext, ErrorFix } from "../../troubleshooting/core/types/error-base";
export declare class FigmaSetupChecker extends BaseErrorHandler {
    private projectRoot;
    constructor(projectRoot: string);
    checkAll(): Promise<void>;
    private checkEnvironment;
    private checkProjectStructure;
    private checkConfigFiles;
    private checkBuildEnvironment;
    protected identifyError(error: Error): BaseErrorCase | null;
    protected validateFix(error: Error, fix: ErrorFix): Promise<boolean>;
    protected generateErrorContext(error: Error): ErrorContext;
    fixAll(): Promise<void>;
    private restoreConfigFiles;
}
