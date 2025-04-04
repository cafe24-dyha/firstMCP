#!/usr/bin/env node
import path from 'path';
import { ManualGenerator } from './manual-generator';
import { TemplateManager } from './template-manager';
import logger from './logger';

/**
 * index.ts
 *
 * MCP 매뉴얼 생성 시스템의 메인 엔트리 포인트입니다.
 * - CLI 인터페이스를 제공합니다.
 * - 매뉴얼 생성 및 백업을 관리합니다.
 */

async function main() {
  try {
    // CLI 인자 파싱
    const args = process.argv.slice(2);
    const projectPath = args.find((arg) => arg.startsWith('--path='))?.split('=')[1] || '.';
    const templatesPath =
      args.find((arg) => arg.startsWith('--templates='))?.split('=')[1] || './templates';
    const outputPath = args.find((arg) => arg.startsWith('--output='))?.split('=')[1] || './output';

    // 절대 경로 변환
    const projectRoot = path.resolve(projectPath);
    const templatesDir = path.resolve(templatesPath);
    const outputDir = path.resolve(outputPath);

    // 템플릿 매니저 초기화
    const templateManager = new TemplateManager(
      {
        templateDir: templatesDir,
        backupDir: path.join(outputDir, 'backups'),
        maxBackups: 10,
        debug: true,
      },
      {
        projectRoot,
      }
    );

    // 매뉴얼 생성기 초기화
    const manualGenerator = new ManualGenerator(templateManager, outputDir);

    // 매뉴얼 생성
    await manualGenerator.generateManual();

    logger.info('매뉴얼 생성이 완료되었습니다.');
    process.exit(0);
  } catch (error) {
    logger.error(`매뉴얼 생성 중 오류 발생: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
