"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const zlib = __importStar(require("zlib"));
const crypto = __importStar(require("crypto"));
const util_1 = require("util");
const gzip = (0, util_1.promisify)(zlib.gzip);
const gunzip = (0, util_1.promisify)(zlib.gunzip);
class BackupManager {
    constructor(backupDir, maxBackups = 10) {
        this.COMPRESSION_LEVEL = 9;
        this.ENCRYPTION_ALGORITHM = 'aes-256-gcm';
        this.ENCRYPTION_KEY_LENGTH = 32;
        this.ENCRYPTION_IV_LENGTH = 16;
        this.CHECKSUM_ALGORITHM = 'sha256';
        this.backupDir = backupDir;
        this.maxBackups = maxBackups;
        this.ensureBackupDir();
    }
    ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            this.logger.info('[DEBUG: 백업 디렉토리 생성-완료] 체크포인트(경로, 권한, 용량)');
        }
    }
    generateEncryptionKey() {
        return crypto.randomBytes(this.ENCRYPTION_KEY_LENGTH);
    }
    generateIV() {
        return crypto.randomBytes(this.ENCRYPTION_IV_LENGTH);
    }
    async encryptData(data, options) {
        const cipher = crypto.createCipheriv(options.algorithm, options.key, options.iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        const authTag = cipher.getAuthTag();
        return Buffer.concat([options.iv, authTag, encrypted]);
    }
    async decryptData(data, options) {
        const iv = data.slice(0, this.ENCRYPTION_IV_LENGTH);
        const authTag = data.slice(this.ENCRYPTION_IV_LENGTH, this.ENCRYPTION_IV_LENGTH + 16);
        const encrypted = data.slice(this.ENCRYPTION_IV_LENGTH + 16);
        const decipher = crypto.createDecipheriv(options.algorithm, options.key, iv);
        decipher.setAuthTag(authTag);
        return Buffer.concat([decipher.update(encrypted), decipher.final()]);
    }
    async calculateChecksum(data) {
        return crypto.createHash(this.CHECKSUM_ALGORITHM).update(data).digest('hex');
    }
    async validateFile(filePath) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            details: {
                fileCount: 0,
                totalSize: 0,
            },
        };
        try {
            const stats = await fs.promises.stat(filePath);
            if (!stats.isFile()) {
                result.errors.push('유효하지 않은 파일입니다.');
                result.isValid = false;
                return result;
            }
            const fileContent = await fs.promises.readFile(filePath);
            result.details.totalSize = stats.size;
            result.details.checksum = await this.calculateChecksum(fileContent);
            if (stats.size === 0) {
                result.warnings.push('파일이 비어있습니다.');
            }
            const storedChecksum = await this.getStoredChecksum(filePath);
            if (storedChecksum && storedChecksum !== result.details.checksum) {
                result.errors.push('체크섬이 일치하지 않습니다.');
                result.isValid = false;
            }
        }
        catch (error) {
            result.errors.push(`파일 검증 중 오류 발생: ${error.message}`);
            result.isValid = false;
        }
        return result;
    }
    async getStoredChecksum(filePath) {
        const checksumPath = `${filePath}.checksum`;
        try {
            return await fs.promises.readFile(checksumPath, 'utf-8');
        }
        catch (_a) {
            return null;
        }
    }
    async storeChecksum(filePath, checksum) {
        const checksumPath = `${filePath}.checksum`;
        await fs.promises.writeFile(checksumPath, checksum);
    }
    async validateBackup(backupName) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            details: {
                fileCount: 0,
                totalSize: 0,
            },
        };
        try {
            const backupPath = path.join(this.backupDir, backupName);
            if (!fs.existsSync(backupPath)) {
                result.errors.push('백업 파일을 찾을 수 없습니다.');
                result.isValid = false;
                return result;
            }
            const stats = await fs.promises.stat(backupPath);
            if (stats.isDirectory()) {
                const files = await fs.promises.readdir(backupPath);
                result.details.fileCount = files.length;
                for (const file of files) {
                    const filePath = path.join(backupPath, file);
                    const fileValidation = await this.validateFile(filePath);
                    if (!fileValidation.isValid) {
                        result.errors.push(`파일 검증 실패: ${file}`);
                        result.isValid = false;
                    }
                    result.details.totalSize += fileValidation.details.totalSize;
                    if (fileValidation.warnings.length > 0) {
                        result.warnings.push(...fileValidation.warnings.map((w) => `${file}: ${w}`));
                    }
                }
            }
            else {
                const fileValidation = await this.validateFile(backupPath);
                result.details.fileCount = 1;
                result.details.totalSize = fileValidation.details.totalSize;
                result.details.checksum = fileValidation.details.checksum;
                if (!fileValidation.isValid) {
                    result.errors.push(...fileValidation.errors);
                    result.isValid = false;
                }
                if (fileValidation.warnings.length > 0) {
                    result.warnings.push(...fileValidation.warnings);
                }
            }
            if (result.details.totalSize === 0) {
                result.warnings.push('백업이 비어있습니다.');
            }
            const backups = await this.listBackups();
            if (backups.length > this.maxBackups) {
                result.warnings.push(`백업 수가 제한을 초과했습니다 (${backups.length}/${this.maxBackups})`);
            }
        }
        catch (error) {
            result.errors.push(`백업 검증 중 오류 발생: ${error.message}`);
            result.isValid = false;
        }
        return result;
    }
    async createBackup(sourceDir, options = {}) {
        const { compress = true, encrypt = false } = options;
        try {
            this.logger.info('[DEBUG: 백업 생성-시작] 체크포인트(소스 경로, 대상 경로, 백업 정책)');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `backup_${timestamp}${compress ? '.gz' : ''}${encrypt ? '.enc' : ''}`;
            const backupPath = path.join(this.backupDir, backupName);
            if (encrypt) {
                await this.createEncryptedBackup(sourceDir, backupPath, compress);
            }
            else if (compress) {
                await this.createCompressedBackup(sourceDir, backupPath);
            }
            else {
                await this.copyDirectory(sourceDir, backupPath);
            }
            this.logger.info('[DEBUG: 백업 파일 생성-완료] 체크포인트(백업 이름, 파일 수, 총 크기)');
            await this.cleanupOldBackups();
            this.logger.info('[DEBUG: 백업 정리-완료] 체크포인트(삭제된 백업 수, 남은 백업 수, 디스크 공간)');
            this.logger.info('[DEBUG: 백업 생성-완료] 체크포인트(백업 경로, 타임스탬프, 상태)');
        }
        catch (error) {
            this.logger.error('[DEBUG: 백업 생성-실패] 체크포인트(에러 타입, 스택 트레이스, 발생 위치)', error);
            throw error;
        }
    }
    async createEncryptedBackup(source, target, compress) {
        const files = await fs.promises.readdir(source);
        let totalSize = 0;
        let processedSize = 0;
        let fileCount = 0;
        const key = this.generateEncryptionKey();
        const iv = this.generateIV();
        const encryptionOptions = {
            algorithm: this.ENCRYPTION_ALGORITHM,
            key,
            iv,
        };
        const keyPath = path.join(this.backupDir, 'encryption.key');
        await fs.promises.writeFile(keyPath, key);
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);
            const stats = await fs.promises.stat(sourcePath);
            if (stats.isDirectory()) {
                await fs.promises.mkdir(targetPath, { recursive: true });
                await this.createEncryptedBackup(sourcePath, targetPath, compress);
            }
            else {
                let fileContent = await fs.promises.readFile(sourcePath);
                if (compress) {
                    fileContent = await gzip(fileContent, { level: this.COMPRESSION_LEVEL });
                }
                const encryptedContent = await this.encryptData(fileContent, encryptionOptions);
                await fs.promises.writeFile(targetPath, encryptedContent);
                totalSize += stats.size;
                processedSize += encryptedContent.length;
                fileCount++;
            }
        }
        const compressionRatio = totalSize > 0 ? (1 - processedSize / totalSize) * 100 : 0;
        this.logger.info(`[DEBUG: 암호화 백업 생성-완료] 체크포인트(파일 수: ${fileCount}, 원본 크기: ${totalSize}bytes, 처리 크기: ${processedSize}bytes, 압축률: ${compressionRatio.toFixed(2)}%)`);
    }
    async createCompressedBackup(source, target) {
        const files = await fs.promises.readdir(source);
        let totalSize = 0;
        let compressedSize = 0;
        let fileCount = 0;
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);
            const stats = await fs.promises.stat(sourcePath);
            if (stats.isDirectory()) {
                await fs.promises.mkdir(targetPath, { recursive: true });
                await this.createCompressedBackup(sourcePath, targetPath);
            }
            else {
                const fileContent = await fs.promises.readFile(sourcePath);
                const compressedContent = await gzip(fileContent, { level: this.COMPRESSION_LEVEL });
                await fs.promises.writeFile(targetPath, compressedContent);
                totalSize += stats.size;
                compressedSize += compressedContent.length;
                fileCount++;
            }
        }
        const compressionRatio = totalSize > 0 ? (1 - compressedSize / totalSize) * 100 : 0;
        this.logger.info(`[DEBUG: 압축 백업 생성-완료] 체크포인트(파일 수: ${fileCount}, 원본 크기: ${totalSize}bytes, 압축 크기: ${compressedSize}bytes, 압축률: ${compressionRatio.toFixed(2)}%)`);
    }
    async copyDirectory(source, target) {
        const files = await fs.promises.readdir(source);
        let totalSize = 0;
        let fileCount = 0;
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);
            const stats = await fs.promises.stat(sourcePath);
            if (stats.isDirectory()) {
                await fs.promises.mkdir(targetPath, { recursive: true });
                await this.copyDirectory(sourcePath, targetPath);
            }
            else {
                await fs.promises.copyFile(sourcePath, targetPath);
                totalSize += stats.size;
                fileCount++;
            }
        }
        this.logger.info(`[DEBUG: 디렉토리 복사-완료] 체크포인트(파일 수: ${fileCount}, 총 크기: ${totalSize}bytes)`);
    }
    async cleanupOldBackups() {
        const backups = await fs.promises.readdir(this.backupDir);
        const backupFiles = backups
            .filter((file) => file.startsWith('backup_'))
            .map((file) => ({
            name: file,
            path: path.join(this.backupDir, file),
            time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime(),
        }))
            .sort((a, b) => b.time - a.time);
        if (backupFiles.length > this.maxBackups) {
            const filesToDelete = backupFiles.slice(this.maxBackups);
            for (const file of filesToDelete) {
                await fs.promises.rm(file.path, { recursive: true, force: true });
                this.logger.info('[DEBUG: 오래된 백업 삭제-완료] 체크포인트(파일명, 삭제 시간, 상태)');
            }
        }
    }
    async restoreBackup(backupName, targetDir, options = {}) {
        const { isCompressed = true, isEncrypted = false } = options;
        try {
            this.logger.info('[DEBUG: 백업 복원-시작] 체크포인트(백업 이름, 대상 경로, 복원 정책)');
            const backupPath = path.join(this.backupDir, backupName);
            if (!fs.existsSync(backupPath)) {
                throw new Error(`백업 파일을 찾을 수 없음: ${backupName}`);
            }
            if (isEncrypted) {
                await this.restoreEncryptedBackup(backupPath, targetDir, isCompressed);
            }
            else if (isCompressed) {
                await this.restoreCompressedBackup(backupPath, targetDir);
            }
            else {
                await this.copyDirectory(backupPath, targetDir);
            }
            this.logger.info('[DEBUG: 백업 복원-완료] 체크포인트(복원 경로, 파일 수, 상태)');
        }
        catch (error) {
            this.logger.error('[DEBUG: 백업 복원-실패] 체크포인트(에러 타입, 스택 트레이스, 발생 위치)', error);
            throw error;
        }
    }
    async restoreEncryptedBackup(source, target, isCompressed) {
        const files = await fs.promises.readdir(source);
        let totalSize = 0;
        let processedSize = 0;
        let fileCount = 0;
        const keyPath = path.join(this.backupDir, 'encryption.key');
        const key = await fs.promises.readFile(keyPath);
        const encryptionOptions = {
            algorithm: this.ENCRYPTION_ALGORITHM,
            key,
            iv: Buffer.alloc(this.ENCRYPTION_IV_LENGTH),
        };
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);
            const stats = await fs.promises.stat(sourcePath);
            if (stats.isDirectory()) {
                await fs.promises.mkdir(targetPath, { recursive: true });
                await this.restoreEncryptedBackup(sourcePath, targetPath, isCompressed);
            }
            else {
                const encryptedContent = await fs.promises.readFile(sourcePath);
                const decryptedContent = await this.decryptData(encryptedContent, encryptionOptions);
                let fileContent = decryptedContent;
                if (isCompressed) {
                    fileContent = await gunzip(decryptedContent);
                }
                await fs.promises.writeFile(targetPath, fileContent);
                totalSize += stats.size;
                processedSize += fileContent.length;
                fileCount++;
            }
        }
        const compressionRatio = totalSize > 0 ? (1 - totalSize / processedSize) * 100 : 0;
        this.logger.info(`[DEBUG: 암호화 백업 복원-완료] 체크포인트(파일 수: ${fileCount}, 압축 크기: ${totalSize}bytes, 복원 크기: ${processedSize}bytes, 압축률: ${compressionRatio.toFixed(2)}%)`);
    }
    async restoreCompressedBackup(source, target) {
        const files = await fs.promises.readdir(source);
        let totalSize = 0;
        let decompressedSize = 0;
        let fileCount = 0;
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);
            const stats = await fs.promises.stat(sourcePath);
            if (stats.isDirectory()) {
                await fs.promises.mkdir(targetPath, { recursive: true });
                await this.restoreCompressedBackup(sourcePath, targetPath);
            }
            else {
                const compressedContent = await fs.promises.readFile(sourcePath);
                const decompressedContent = await gunzip(compressedContent);
                await fs.promises.writeFile(targetPath, decompressedContent);
                totalSize += stats.size;
                decompressedSize += decompressedContent.length;
                fileCount++;
            }
        }
        const compressionRatio = totalSize > 0 ? (1 - totalSize / decompressedSize) * 100 : 0;
        this.logger.info(`[DEBUG: 압축 백업 복원-완료] 체크포인트(파일 수: ${fileCount}, 압축 크기: ${totalSize}bytes, 복원 크기: ${decompressedSize}bytes, 압축률: ${compressionRatio.toFixed(2)}%)`);
    }
    async listBackups() {
        const backups = await fs.promises.readdir(this.backupDir);
        return backups
            .filter((file) => file.startsWith('backup_'))
            .map((file) => ({
            name: file,
            time: fs.statSync(path.join(this.backupDir, file)).mtime.getTime(),
        }))
            .sort((a, b) => b.time - a.time)
            .map((file) => file.name);
    }
}
exports.BackupManager = BackupManager;
exports.default = BackupManager;
//# sourceMappingURL=backup-manager.js.map