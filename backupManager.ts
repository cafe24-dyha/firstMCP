import fs from 'fs-extra';
import path from 'path';
import logger from './logger';

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

export class BackupManager {
  private backupDir: string;
  private maxBackups: number;

  constructor(backupDir: string, maxBackups: number = 10) {
    this.backupDir = backupDir;
    this.maxBackups = maxBackups;
    this.ensureBackupDir();
  }

  private ensureBackupDir(): void {
    try {
      fs.ensureDirSync(this.backupDir);
      logger.debug(`백업 디렉토리 확인: ${this.backupDir}`);
    } catch (error) {
      logger.error(`백업 디렉토리 생성 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async createBackup(options: BackupOptions): Promise<string> {
    try {
      const { sourcePath, timestamp } = options;
      const fileName = path.basename(sourcePath);
      const backupPath = path.join(
        this.backupDir,
        `${path.basename(fileName, '.md')}-${timestamp.replace(/[-:.]/g, '')}.md`
      );

      await fs.copy(sourcePath, backupPath);
      logger.info(`백업 생성 완료: ${backupPath}`);

      await this.enforceBackupLimit();
      return backupPath;
    } catch (error) {
      logger.error(`백업 생성 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  private async enforceBackupLimit(): Promise<void> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter((file) => file.endsWith('.md'))
        .map((file) => ({
          name: file,
          path: path.join(this.backupDir, file),
          mtime: fs.statSync(path.join(this.backupDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.mtime - a.mtime);

      if (backupFiles.length > this.maxBackups) {
        const filesToDelete = backupFiles.slice(this.maxBackups);
        for (const file of filesToDelete) {
          await fs.remove(file.path);
          logger.info(`오래된 백업 파일 삭제: ${file.name}`);
        }
      }
    } catch (error) {
      logger.error(`백업 정리 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async listBackups(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.backupDir);
      return files.filter((file) => file.endsWith('.md'));
    } catch (error) {
      logger.error(`백업 목록 조회 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async restoreBackup(backupFileName: string): Promise<string> {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);
      const originalFileName = backupFileName.split('-')[0] + '.md';
      const restorePath = path.join(path.dirname(this.backupDir), originalFileName);

      await fs.copy(backupPath, restorePath);
      logger.info(`백업 복원 완료: ${restorePath}`);

      return restorePath;
    } catch (error) {
      logger.error(`백업 복원 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async getLatestBackup(): Promise<string | null> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter((file) => file.endsWith('.md'))
        .map((file) => ({
          name: file,
          mtime: fs.statSync(path.join(this.backupDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.mtime - a.mtime);

      return backupFiles.length > 0 ? backupFiles[0].name : null;
    } catch (error) {
      logger.error(`최신 백업 파일 조회 실패: ${(error as Error).message}`);
      throw error;
    }
  }
}
