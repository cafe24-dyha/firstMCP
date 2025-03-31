#!/usr/bin/env node
import path from 'path';
import * as fs from 'fs-extra';
import { ManualGenerator } from './manual-generator';
import logger from './logger';

/**
 * index.ts
 *
 * MCP 매뉴얼 생성 시스템의 메인 엔트리 포인트입니다.
 * - Directory-Agnostic Execution: @scripts-main은 고정된 위치에서 실행
 * - Context-Driven Output: 매뉴얼은 @manuals/manuals에 생성
 * - 처리 대상: 요청 폴더의 scripts-main 디렉토리
 */

async function main() {
  try {
    // @scripts-main의 절대 경로 (고정 위치)
    const scriptsMainDir = path.resolve(__dirname);

    // CLI 인자 파싱
    const args = process.argv.slice(2);
    const projectPath = args.find((arg) => arg.startsWith('--path='))?.split('=')[1] || '.';
    const templatesPath = path.join(scriptsMainDir, 'templates');

    // 요청 폴더의 scripts-main 절대 경로
    const projectRoot = path.resolve(projectPath);

    // @manuals 디렉토리의 manuals 폴더
    const outputDir = path.join(projectRoot, 'manuals');

    logger.info(`프로젝트 경로: ${projectPath}`);
    logger.info(`분석 대상 경로: ${projectRoot}`);
    logger.info(`출력 경로: ${outputDir}`);
    logger.info(`템플릿 경로: ${templatesPath}`);

    // 경로 존재 확인
    if (!(await fs.pathExists(projectRoot))) {
      throw new Error(`프로젝트 경로가 존재하지 않습니다: ${projectRoot}`);
    }
    if (!(await fs.pathExists(templatesPath))) {
      throw new Error(`템플릿 경로가 존재하지 않습니다: ${templatesPath}`);
    }

    // 출력 디렉토리 생성
    await fs.ensureDir(outputDir);

    // 매뉴얼 생성기 초기화
    const manualGenerator = new ManualGenerator({
      inputDir: projectRoot,
      templateDir: templatesPath,
      outputDir: outputDir,
      debug: true,
    });

    // 매뉴얼 생성
    await manualGenerator.generate();

    // 매뉴얼 복사
    const manualFiles = ['main.md', 'control.md', 'figma-setup.md'];
    for (const file of manualFiles) {
      const sourcePath = path.join(outputDir, file);
      const targetPath = path.join(path.dirname(projectRoot), 'manuals', file);
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetPath);
        logger.info(`매뉴얼이 생성되었습니다: ${targetPath}`);
      }
    }

    logger.info(`매뉴얼이 생성되었습니다: ${outputDir}`);
    process.exit(0);
  } catch (error) {
    logger.error(`매뉴얼 생성 중 오류 발생: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
