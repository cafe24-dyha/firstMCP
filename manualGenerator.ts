import fs from 'fs-extra';
import path from 'path';
import handlebars from 'handlebars';
import logger from './logger';

/**
 * manualGenerator.ts
 *
 * 매뉴얼 생성을 담당하는 모듈입니다.
 * - Handlebars 템플릿 엔진을 사용하여 매뉴얼을 생성합니다.
 * - 템플릿 파일을 로드하고 처리합니다.
 * - 생성된 매뉴얼을 저장합니다.
 */

export interface ManualData {
  title: string;
  version: string;
  author: string;
  date: string;
  description: string;
  setup?: string[];
  features?: string[];
  configuration?: Record<string, unknown>;
}

export class ManualGenerator {
  private templateDir: string;
  private outputDir: string;

  constructor(templateDir: string, outputDir: string) {
    this.templateDir = templateDir;
    this.outputDir = outputDir;
    this.initializeDirectories();
  }

  private initializeDirectories(): void {
    try {
      fs.ensureDirSync(this.templateDir);
      fs.ensureDirSync(this.outputDir);
      logger.info('디렉토리 초기화 완료');
    } catch (error) {
      logger.error(`디렉토리 초기화 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async generateManual(templateName: string, data: ManualData): Promise<string> {
    try {
      const templatePath = path.join(this.templateDir, templateName);
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      // Handlebars 템플릿 컴파일 및 데이터 적용
      const template = handlebars.compile(templateContent);
      const manualContent = template(data);

      // 생성된 매뉴얼 저장
      const outputPath = path.join(this.outputDir, `${path.basename(templateName, '.hbs')}.md`);
      await fs.writeFile(outputPath, manualContent, 'utf-8');

      logger.info(`매뉴얼 생성 완료: ${outputPath}`);
      return outputPath;
    } catch (error) {
      logger.error(`매뉴얼 생성 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async registerPartial(name: string, partialPath: string): Promise<void> {
    try {
      const partialContent = await fs.readFile(partialPath, 'utf-8');
      handlebars.registerPartial(name, partialContent);
      logger.info(`부분 템플릿 등록 완료: ${name}`);
    } catch (error) {
      logger.error(`부분 템플릿 등록 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public registerHelper(name: string, helper: handlebars.HelperDelegate): void {
    try {
      handlebars.registerHelper(name, helper);
      logger.info(`헬퍼 함수 등록 완료: ${name}`);
    } catch (error) {
      logger.error(`헬퍼 함수 등록 실패: ${(error as Error).message}`);
      throw error;
    }
  }
}
