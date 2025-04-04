import fs from 'fs-extra';
import path from 'path';
import { TemplateManager } from './template-manager';
import logger from './logger';

export class ManualGenerator {
  private templateManager: TemplateManager;
  private outputDir: string;

  constructor(templateManager: TemplateManager, outputDir: string) {
    this.templateManager = templateManager;
    this.outputDir = outputDir;
  }

  public async generateManual(): Promise<void> {
    try {
      // 메인 매뉴얼 생성
      const mainTemplatePath = path.join(this.templateManager.getTemplateDir(), 'main.md');
      const mainOutputPath = path.join(this.outputDir, 'main.md');

      // 템플릿 데이터 가져오기
      const templateData = this.templateManager.getDefaultTemplateData();

      // 템플릿 처리
      const mainContent = await this.templateManager.processTemplate(
        mainTemplatePath,
        templateData
      );

      // 결과 저장
      await fs.writeFile(mainOutputPath, mainContent, 'utf-8');
      logger.info(`매뉴얼 생성 완료: ${mainOutputPath}`);

      // 백업 생성
      const backupPath = path.join(
        this.outputDir,
        'backups',
        `main-${new Date().toISOString().replace(/[-:.]/g, '')}.md`
      );
      await fs.ensureDir(path.dirname(backupPath));
      await fs.copy(mainOutputPath, backupPath);
      logger.info(`매뉴얼 백업 생성 완료: ${backupPath}`);

      // 시스템 상태 업데이트
      await this.templateManager.updateStatus({
        lastRun: new Date().toISOString(),
        status: 'SUCCESS',
        outputPath: mainOutputPath,
      });
    } catch (error) {
      logger.error(`매뉴얼 생성 실패: ${(error as Error).message}`);
      throw error;
    }
  }
}
