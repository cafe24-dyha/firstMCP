#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const manual_generator_1 = require("./manual-generator");
const template_manager_1 = require("./template-manager");
const logger_1 = __importDefault(require("./logger"));
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
        const templatesPath = args.find((arg) => arg.startsWith('--templates='))?.split('=')[1] || './templates';
        // 절대 경로 변환
        const projectRoot = path_1.default.resolve(projectPath);
        const templatesDir = path_1.default.resolve(templatesPath);
        // 요청 폴더(@manuals)의 manuals 폴더에 매뉴얼 생성
        const outputDir = path_1.default.resolve(path_1.default.join(projectRoot, '..', 'manuals'));
        // 템플릿 매니저 초기화
        const templateManager = new template_manager_1.TemplateManager({
            templateDir: templatesDir,
            backupDir: path_1.default.join(outputDir, 'backups'),
            maxBackups: 10,
            debug: true,
        }, {
            projectRoot,
        });
        // 매뉴얼 생성기 초기화
        const manualGenerator = new manual_generator_1.ManualGenerator(templateManager, outputDir);
        // 매뉴얼 생성
        await manualGenerator.generateManual();
        logger_1.default.info('매뉴얼 생성이 완료되었습니다.');
        process.exit(0);
    }
    catch (error) {
        logger_1.default.error(`매뉴얼 생성 중 오류 발생: ${error.message}`);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map