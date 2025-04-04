/**
 * backupManager.ts
 *
 * 백업 파일 관리를 위한 모듈입니다.
 * - 지정된 디렉토리의 백업 파일을 관리합니다.
 * - 백업 파일 수를 제한하고 자동으로 정리합니다.
 * - 백업 파일의 무결성을 검증합니다.
 */
export interface BackupOptions {
    sourcePath: string;
    timestamp: string;
}
export declare class BackupManager {
    private backupDir;
    private maxBackups;
    constructor(backupDir: string, maxBackups?: number);
    private ensureBackupDir;
    createBackup(options: BackupOptions): Promise<string>;
    private enforceBackupLimit;
    listBackups(): Promise<string[]>;
    restoreBackup(backupFileName: string): Promise<string>;
    getLatestBackup(): Promise<string | null>;
}
