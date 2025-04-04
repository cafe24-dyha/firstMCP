export const __esModule: boolean;
export class BackupManager {
    constructor(backupDir: any, maxBackups?: number);
    backupDir: any;
    maxBackups: number;
    ensureBackupDir(): void;
    createBackup(options: any): Promise<any>;
    enforceBackupLimit(): Promise<void>;
    listBackups(): Promise<any>;
    restoreBackup(backupFileName: any): Promise<any>;
    getLatestBackup(): Promise<any>;
}
