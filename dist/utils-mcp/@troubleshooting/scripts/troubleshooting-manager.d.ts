/// <reference types="node" />
import { EventEmitter } from "events";
export declare class TroubleshootingManager extends EventEmitter {
    private targetDir;
    private manualPath;
    private scriptsPath;
    private templatePath;
    private errorHistory;
    private errorCategories;
    private templates;
    private errorHandler;
    private errorLogger;
    private errorFixer;
    private startTime;
    private errorCount;
    private readonly MAX_ERRORS;
    private readonly MAX_RECOVERY_ATTEMPTS;
    private gitConfig;
    private deploymentHistory;
    private readonly TIMEOUT_MS;
    private timeoutTimer;
    private fileWatcher;
    constructor(targetDir: string);
    private setupErrorListeners;
    private initializeTemplates;
    private loadTemplates;
    private createNewTemplate;
    private extractErrorPattern;
    private saveTemplates;
    startWatching(): Promise<void>;
    private startFileWatcher;
    private handleError;
    private categorizeError;
    private logError;
    private findMatchingTemplate;
    private attemptAutoFix;
    private checkFileExists;
    private checkDuplicate;
    private markErrorResolved;
    private addToHistory;
    stopWatching(): Promise<void>;
    private initializeCategories;
    private checkAndUpdateManual;
    private initializeManual;
    private processScripts;
    private analyzeScript;
    private updateManualWithScript;
    /**
     * 디렉토리 확인 및 생성
     */
    private ensureDirectories;
    /**
     * GitHub 배포 설정 업데이트
     */
    updateGitHubConfig(config: Partial<import("./utils/github-deployer").GitHubConfig>): void;
    /**
     * GitHub 배포 활성화/비활성화
     */
    setGitHubDeploymentEnabled(enabled: boolean): void;
    /**
     * GitHub 배포 이력 조회
     */
    getGitHubDeploymentHistory(): Array<{
        timestamp: number;
        issue: string;
        success: boolean;
        commitHash?: string;
        error?: string;
    }>;
    private startTimeoutTimer;
    private resetTimeoutTimer;
    private cleanup;
    start(): Promise<void>;
    private initialize;
    private watchErrors;
    private updateManual;
}
