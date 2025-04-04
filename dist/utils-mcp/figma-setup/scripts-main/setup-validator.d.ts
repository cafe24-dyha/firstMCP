import { BaseErrorHandler } from "../../troubleshooting/scripts/error-handler";
export interface FigmaPluginConfig {
    name: string;
    id: string;
    api: string;
    main: string;
    ui: string;
    editorType: string[];
    networkAccess?: {
        allowedDomains: string[];
        reasoning: string;
    };
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class FigmaSetupValidator extends BaseErrorHandler {
    private config;
    private projectRoot;
    constructor(config: FigmaPluginConfig, projectRoot: string);
    validateEnvironment(): Promise<ValidationResult>;
    validateStructure(): Promise<ValidationResult>;
    validateManifest(): Promise<ValidationResult>;
    private fileExists;
    private checkVersion;
    validateAll(): Promise<ValidationResult>;
}
