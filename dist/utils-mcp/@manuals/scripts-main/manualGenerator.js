"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualGenerator = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const logger_1 = __importDefault(require("./logger"));
class ManualGenerator {
    constructor(templateDir, outputDir) {
        this.templateDir = templateDir;
        this.outputDir = outputDir;
        this.initializeDirectories();
    }
    initializeDirectories() {
        try {
            fs_extra_1.default.ensureDirSync(this.templateDir);
            fs_extra_1.default.ensureDirSync(this.outputDir);
            logger_1.default.info('디렉토리 초기화 완료');
        }
        catch (error) {
            logger_1.default.error(`디렉토리 초기화 실패: ${error.message}`);
            throw error;
        }
    }
    async generateManual(templateName, data) {
        try {
            const templatePath = path_1.default.join(this.templateDir, templateName);
            const templateContent = await fs_extra_1.default.readFile(templatePath, 'utf-8');
            // Handlebars 템플릿 컴파일 및 데이터 적용
            const template = handlebars_1.default.compile(templateContent);
            const manualContent = template(data);
            // 생성된 매뉴얼 저장
            const outputPath = path_1.default.join(this.outputDir, `${path_1.default.basename(templateName, '.hbs')}.md`);
            await fs_extra_1.default.writeFile(outputPath, manualContent, 'utf-8');
            logger_1.default.info(`매뉴얼 생성 완료: ${outputPath}`);
            return outputPath;
        }
        catch (error) {
            logger_1.default.error(`매뉴얼 생성 실패: ${error.message}`);
            throw error;
        }
    }
    async registerPartial(name, partialPath) {
        try {
            const partialContent = await fs_extra_1.default.readFile(partialPath, 'utf-8');
            handlebars_1.default.registerPartial(name, partialContent);
            logger_1.default.info(`부분 템플릿 등록 완료: ${name}`);
        }
        catch (error) {
            logger_1.default.error(`부분 템플릿 등록 실패: ${error.message}`);
            throw error;
        }
    }
    registerHelper(name, helper) {
        try {
            handlebars_1.default.registerHelper(name, helper);
            logger_1.default.info(`헬퍼 함수 등록 완료: ${name}`);
        }
        catch (error) {
            logger_1.default.error(`헬퍼 함수 등록 실패: ${error.message}`);
            throw error;
        }
    }
}
exports.ManualGenerator = ManualGenerator;
//# sourceMappingURL=manualGenerator.js.map