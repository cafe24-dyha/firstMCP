export const __esModule: boolean;
export class TemplateManager {
    constructor(options: any, config: any);
    templateDir: any;
    backupDir: any;
    maxBackups: any;
    debug: any;
    config: any;
    initializeDirectories(): void;
    createPipelineTemplate(pipeline: any): Promise<void>;
    generatePipelineContent(pipeline: any): string;
    backupTemplate(templateName: any): Promise<void>;
    enforceBackupLimit(): Promise<void>;
    restoreTemplate(backupName: any): Promise<void>;
    recordChange(change: any): Promise<void>;
    updateStatus(status: any): Promise<void>;
    generateChangelog(): Promise<any>;
    processTemplate(templatePath: any, data: any): Promise<any>;
    getDefaultTemplateData(): {
        systemName: string;
        systemPurpose: string;
        environments: {
            name: string;
            description: string;
        }[];
        projectRoot: any;
        directoryStructure: string;
        fileDescriptions: {
            path: string;
            description: string;
        }[];
        validationCriteria: {
            title: string;
            description: string;
        }[];
        validationMethods: {
            title: string;
            description: string;
        }[];
        validationResults: {
            title: string;
            description: string;
        }[];
        pipelines: {
            index: number;
            name: string;
            steps: string[];
        }[];
        features: {
            index: number;
            name: string;
            details: string[];
        }[];
        backupManagement: {
            title: string;
            description: string;
        }[];
        structuralAspects: {
            title: string;
            description: string;
        }[];
        functionalAspects: {
            title: string;
            description: string;
        }[];
        codeQuality: {
            title: string;
            description: string;
        }[];
        extensibility: {
            title: string;
            description: string;
        }[];
        basicCommand: string;
        pathCommand: string;
        changes: {
            date: string;
            description: string;
        }[];
        generated_date: string;
    };
    getTemplateDir(): any;
}
