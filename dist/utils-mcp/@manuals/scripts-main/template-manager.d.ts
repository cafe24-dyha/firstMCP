import { ManualTemplateData } from './types.d';
/**
 * template-manager.ts
 *
 * 템플릿 관리를 담당하는 모듈입니다.
 * - 템플릿 초기화 및 백업
 * - 파이프라인/워크플로우 템플릿 관리
 * - 템플릿 데이터 변환
 */
export interface TemplateManagerOptions {
    templateDir: string;
    backupDir: string;
    maxBackups: number;
    debug?: boolean;
}
export interface PipelineTemplate {
    name: string;
    steps: {
        description: string;
        sourcePath: string;
        targetPath: string;
    }[];
}
export interface TemplateManagerConfig {
    projectRoot: string;
}
export interface ChangeRecord {
    type: string;
    description: string;
    timestamp: string;
    status: string;
    author?: string;
    scope?: string;
    relatedFiles?: string[];
}
export interface SystemStatus {
    lastRun: string;
    status: string;
    outputPath: string;
}
export declare class TemplateManager {
    private templateDir;
    private backupDir;
    private maxBackups;
    private debug;
    private config;
    constructor(options: TemplateManagerOptions, config: TemplateManagerConfig);
    private initializeDirectories;
    createPipelineTemplate(pipeline: PipelineTemplate): Promise<void>;
    private generatePipelineContent;
    backupTemplate(templateName: string): Promise<void>;
    private enforceBackupLimit;
    restoreTemplate(backupName: string): Promise<void>;
    recordChange(change: ChangeRecord): Promise<void>;
    updateStatus(status: SystemStatus): Promise<void>;
    generateChangelog(): Promise<string>;
    processTemplate(templatePath: string, data: ManualTemplateData): Promise<string>;
    getDefaultTemplateData(): ManualTemplateData;
    getTemplateDir(): string;
}
