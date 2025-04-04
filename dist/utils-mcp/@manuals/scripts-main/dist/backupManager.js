"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupManager = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
class BackupManager {
    constructor(backupDir, maxBackups = 10) {
        this.backupDir = backupDir;
        this.maxBackups = maxBackups;
        this.ensureBackupDir();
    }
    ensureBackupDir() {
        try {
            fs_extra_1.default.ensureDirSync(this.backupDir);
            logger_1.default.debug(`백업 디렉토리 확인: ${this.backupDir}`);
        }
        catch (error) {
            logger_1.default.error(`백업 디렉토리 생성 실패: ${error.message}`);
            throw error;
        }
    }
    async createBackup(options) {
        try {
            const { sourcePath, timestamp } = options;
            const fileName = path_1.default.basename(sourcePath);
            const backupPath = path_1.default.join(this.backupDir, `${path_1.default.basename(fileName, '.md')}-${timestamp.replace(/[-:.]/g, '')}.md`);
            await fs_extra_1.default.copy(sourcePath, backupPath);
            logger_1.default.info(`백업 생성 완료: ${backupPath}`);
            await this.enforceBackupLimit();
            return backupPath;
        }
        catch (error) {
            logger_1.default.error(`백업 생성 실패: ${error.message}`);
            throw error;
        }
    }
    async enforceBackupLimit() {
        try {
            const files = await fs_extra_1.default.readdir(this.backupDir);
            const backupFiles = files
                .filter((file) => file.endsWith('.md'))
                .map((file) => ({
                name: file,
                path: path_1.default.join(this.backupDir, file),
                mtime: fs_extra_1.default.statSync(path_1.default.join(this.backupDir, file)).mtime.getTime(),
            }))
                .sort((a, b) => b.mtime - a.mtime);
            if (backupFiles.length > this.maxBackups) {
                const filesToDelete = backupFiles.slice(this.maxBackups);
                for (const file of filesToDelete) {
                    await fs_extra_1.default.remove(file.path);
                    logger_1.default.info(`오래된 백업 파일 삭제: ${file.name}`);
                }
            }
        }
        catch (error) {
            logger_1.default.error(`백업 정리 실패: ${error.message}`);
            throw error;
        }
    }
    async listBackups() {
        try {
            const files = await fs_extra_1.default.readdir(this.backupDir);
            return files.filter((file) => file.endsWith('.md'));
        }
        catch (error) {
            logger_1.default.error(`백업 목록 조회 실패: ${error.message}`);
            throw error;
        }
    }
    async restoreBackup(backupFileName) {
        try {
            const backupPath = path_1.default.join(this.backupDir, backupFileName);
            const originalFileName = backupFileName.split('-')[0] + '.md';
            const restorePath = path_1.default.join(path_1.default.dirname(this.backupDir), originalFileName);
            await fs_extra_1.default.copy(backupPath, restorePath);
            logger_1.default.info(`백업 복원 완료: ${restorePath}`);
            return restorePath;
        }
        catch (error) {
            logger_1.default.error(`백업 복원 실패: ${error.message}`);
            throw error;
        }
    }
    async getLatestBackup() {
        try {
            const files = await fs_extra_1.default.readdir(this.backupDir);
            const backupFiles = files
                .filter((file) => file.endsWith('.md'))
                .map((file) => ({
                name: file,
                mtime: fs_extra_1.default.statSync(path_1.default.join(this.backupDir, file)).mtime.getTime(),
            }))
                .sort((a, b) => b.mtime - a.mtime);
            return backupFiles.length > 0 ? backupFiles[0].name : null;
        }
        catch (error) {
            logger_1.default.error(`최신 백업 파일 조회 실패: ${error.message}`);
            throw error;
        }
    }
}
exports.BackupManager = BackupManager;
//# sourceMappingURL=backupManager.js.map