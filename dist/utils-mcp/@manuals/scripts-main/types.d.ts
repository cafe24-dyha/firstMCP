export interface SystemConfig {
    debug?: boolean;
    logLevel?: string;
    maxBackups?: number;
    templateDir: string;
    outputDir: string;
}
export interface TemplateContext {
    title: string;
    version: string;
    author: string;
    date: string;
    description: string;
    setup: string[];
    features: string[];
    configuration: {
        [key: string]: string | number | boolean;
    };
    dependencies?: string[];
    changes?: {
        version: string;
        date: string;
        description: string;
    }[];
}
export interface ManualGeneratorOptions {
    inputDir: string;
    outputDir: string;
    templateDir: string;
    debug?: boolean;
}
export interface LoggerOptions {
    level: string;
    logDir: string;
    debug?: boolean;
}
export interface TemplateManagerOptions {
    templateDir: string;
    backupDir: string;
    maxBackups: number;
    debug?: boolean;
}
