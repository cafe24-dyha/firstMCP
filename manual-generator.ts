import * as fs from 'fs-extra';
import * as path from 'path';
import logger from './logger';
import { ManualGeneratorOptions, ManualTemplateData } from './types';
import { TemplateManager } from './template-manager';

export class ManualGenerator {
  private templateManager: TemplateManager;
  private options: ManualGeneratorOptions;

  constructor(options: ManualGeneratorOptions) {
    this.options = options;
    this.templateManager = new TemplateManager(
      {
        projectRoot: options.inputDir,
        templateDir: options.templateDir,
        backupDir: path.join(options.outputDir, 'backups'),
        maxBackups: 10,
        debug: options.debug,
      },
      {
        projectRoot: options.inputDir,
      }
    );
  }

  public async generate(): Promise<void> {
    try {
      // 템플릿 데이터 준비
      const templateData = await this.templateManager.getDefaultTemplateData();

      // 출력 디렉토리 생성
      const outputDir = path.join(path.dirname(this.options.inputDir), 'manuals');
      await fs.ensureDir(outputDir);
      await fs.ensureDir(path.join(outputDir, 'backups'));

      // 기존 매뉴얼 백업
      await this.backupExistingManuals(outputDir);

      // 매뉴얼 생성
      await this.generateManuals(templateData, outputDir);

      logger.info(`매뉴얼이 생성되었습니다: ${outputDir}`);
    } catch (error) {
      logger.error(`매뉴얼 생성 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  private async backupExistingManuals(outputDir: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '');
      const files = ['main.md', 'control.md', 'figma-setup.md'];

      for (const file of files) {
        const sourcePath = path.join(outputDir, file);
        if (await fs.pathExists(sourcePath)) {
          const backupPath = path.join(
            outputDir,
            'backups',
            `${path.parse(file).name}-${timestamp}${path.parse(file).ext}`
          );
          await fs.copy(sourcePath, backupPath);
        }
      }
    } catch (error) {
      logger.error(`매뉴얼 백업 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  private async generateManuals(
    templateData: ManualTemplateData,
    outputDir: string
  ): Promise<void> {
    try {
      const templateFiles = ['main', 'control', 'figma-setup'];

      // 매뉴얼 생성
      for (const name of templateFiles) {
        const templatePath = path.join(this.options.templateDir, `${name}.md`);
        const content = await this.templateManager.processTemplate(templatePath, templateData);
        const outputPath = path.join(outputDir, `${name}.md`);
        await fs.writeFile(outputPath, content, 'utf-8');
        logger.info(`매뉴얼이 생성되었습니다: ${outputPath}`);
      }

      // 타겟 디렉토리에 복사
      const targetDir = path.join(
        path.dirname(this.options.inputDir),
        'figma-mcp-server',
        'manuals'
      );
      await fs.ensureDir(targetDir);
      for (const name of templateFiles) {
        const sourcePath = path.join(outputDir, `${name}.md`);
        const targetPath = path.join(targetDir, `${name}.md`);
        await fs.copy(sourcePath, targetPath);
        logger.info(`매뉴얼이 생성되었습니다: ${targetPath}`);
      }
    } catch (error) {
      logger.error(`매뉴얼 파일 생성 실패: ${(error as Error).message}`);
      throw error;
    }
  }
}
