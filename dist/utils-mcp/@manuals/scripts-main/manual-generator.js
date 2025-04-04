"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualGenerator = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
class ManualGenerator {
    constructor(templateManager, outputDir) {
        this.templateManager = templateManager;
        this.outputDir = outputDir;
    }
    async generateManual() {
        try {
            // 메인 매뉴얼 생성
            const mainTemplatePath = path_1.default.join(this.templateManager.getTemplateDir(), 'main.md');
            const mainOutputPath = path_1.default.join(this.outputDir, 'main.md');
            // 템플릿 데이터 가져오기
            const templateData = this.templateManager.getDefaultTemplateData();
            // 템플릿 처리
            const mainContent = await this.templateManager.processTemplate(mainTemplatePath, templateData);
            // 결과 저장
            await fs_extra_1.default.writeFile(mainOutputPath, mainContent, 'utf-8');
            logger_1.default.info(`매뉴얼 생성 완료: ${mainOutputPath}`);
            // 백업 생성
            const backupPath = path_1.default.join(this.outputDir, 'backups', `main-${new Date().toISOString().replace(/[-:.]/g, '')}.md`);
            await fs_extra_1.default.ensureDir(path_1.default.dirname(backupPath));
            await fs_extra_1.default.copy(mainOutputPath, backupPath);
            logger_1.default.info(`매뉴얼 백업 생성 완료: ${backupPath}`);
            // 시스템 상태 업데이트
            await this.templateManager.updateStatus({
                lastRun: new Date().toISOString(),
                status: 'SUCCESS',
                outputPath: mainOutputPath,
            });
        }
        catch (error) {
            logger_1.default.error(`매뉴얼 생성 실패: ${error.message}`);
            throw error;
        }
    }
}
exports.ManualGenerator = ManualGenerator;
//# sourceMappingURL=manual-generator.js.map