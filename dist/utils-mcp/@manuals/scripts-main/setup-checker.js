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
exports.setupChecker = exports.SetupChecker = void 0;
const logger_1 = require("./logger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SetupChecker {
    constructor() {
        this.logger = logger_1.Logger.getInstance();
        this.config = new types_1.MCPConfig();
        this.requiredDirs = ['templates', 'output', 'logs', 'backups'];
    }
    static getInstance() {
        if (!SetupChecker.instance) {
            SetupChecker.instance = new SetupChecker();
        }
        return SetupChecker.instance;
    }
    async check() {
        try {
            this.logger.debug('환경 점검 시작');
            await this.checkDirectories();
            await this.checkPermissions();
            await this.checkTemplates();
            await this.checkDirectoryStructure();
            await this.checkFilePermissions();
            await this.checkSystemResources();
            await this.checkDependencies();
            this.logger.info('환경 점검 완료');
        }
        catch (error) {
            this.logger.error('환경 점검 중 오류 발생', { error });
            throw error;
        }
    }
    async checkDirectories() {
        for (const dir of this.requiredDirs) {
            const dirPath = path.join(process.cwd(), dir);
            if (!fs.existsSync(dirPath)) {
                this.logger.debug(`디렉토리 생성: ${dir}`);
                fs.mkdirSync(dirPath, { recursive: true });
            }
        }
    }
    async checkPermissions() {
        for (const dir of this.requiredDirs) {
            const dirPath = path.join(process.cwd(), dir);
            try {
                await fs.promises.access(dirPath, fs.constants.R_OK);
                await fs.promises.access(dirPath, fs.constants.W_OK);
            }
            catch (error) {
                throw new Error(`디렉토리 권한 오류: ${dir}`);
            }
        }
    }
    async checkTemplates() {
        const templatesDir = path.join(process.cwd(), 'templates');
        const requiredTemplates = ['main.md', 'control.md'];
        for (const template of requiredTemplates) {
            const templatePath = path.join(templatesDir, template);
            if (!fs.existsSync(templatePath)) {
                this.logger.warn(`템플릿 파일 없음: ${template}`);
                await this.createDefaultTemplate(template);
            }
        }
    }
    async createDefaultTemplate(templateName) {
        const templatesDir = path.join(process.cwd(), 'templates');
        const templatePath = path.join(templatesDir, templateName);
        let defaultContent = '';
        if (templateName === 'main.md') {
            defaultContent = '# MCP 자율 최적화 매뉴얼\n\n## 시스템 개요\n\n시스템 설명을 입력하세요.';
        }
        else if (templateName === 'control.md') {
            defaultContent =
                '# MCP 자율 최적화 매뉴얼 컨트롤 가이드\n\n## 시스템 흐름\n\n시스템 흐름을 설명하세요.';
        }
        await fs.promises.writeFile(templatePath, defaultContent);
        this.logger.info(`기본 템플릿 생성: ${templateName}`);
    }
    async checkDirectoryStructure() {
        const directories = [
            this.config.targetDir,
            this.config.scriptsDir,
            this.config.manualsDir,
            this.config.templatesDir,
            this.config.backupDir,
            this.config.logsDir,
        ];
        for (const dir of directories) {
            try {
                await fs.promises.access(dir);
            }
            catch (_a) {
                throw new Error(`디렉토리 없음: ${dir}`);
            }
        }
    }
    async checkFilePermissions() {
        const files = [
            path.join(this.config.templatesDir, 'main.md'),
            path.join(this.config.templatesDir, 'control.md'),
            path.join(this.config.manualsDir, 'main.md'),
            path.join(this.config.manualsDir, 'control.md'),
        ];
        for (const file of files) {
            try {
                await fs.promises.access(file, fs.constants.R_OK | fs.constants.W_OK);
            }
            catch (_a) {
                throw new Error(`파일 권한 오류: ${file}`);
            }
        }
    }
    async checkSystemResources() {
        const memoryUsage = process.memoryUsage();
        const freeMemory = memoryUsage.heapTotal - memoryUsage.heapUsed;
        if (freeMemory < 100 * 1024 * 1024) {
            throw new Error('메모리 부족');
        }
        const diskSpace = await this.getDiskSpace();
        if (diskSpace < 1 * 1024 * 1024 * 1024) {
            throw new Error('디스크 공간 부족');
        }
    }
    async checkDependencies() {
        var _a, _b;
        const packageJsonPath = path.join(this.config.targetDir, 'package.json');
        try {
            const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf-8'));
            const requiredDependencies = ['typescript', 'ts-node', 'jest', 'eslint', 'prettier'];
            for (const dep of requiredDependencies) {
                if (!((_a = packageJson.dependencies) === null || _a === void 0 ? void 0 : _a[dep]) && !((_b = packageJson.devDependencies) === null || _b === void 0 ? void 0 : _b[dep])) {
                    throw new Error(`필수 의존성 누락: ${dep}`);
                }
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`의존성 검사 실패: ${error.message}`);
            }
            throw new Error('의존성 검사 실패: 알 수 없는 오류');
        }
    }
    async getDiskSpace() {
        return 2 * 1024 * 1024 * 1024;
    }
    getCheckResults() {
        return {
            directoryStructure: true,
            filePermissions: true,
            systemResources: true,
            dependencies: true,
        };
    }
}
exports.SetupChecker = SetupChecker;
SetupChecker.instance = null;
exports.setupChecker = SetupChecker.getInstance();
//# sourceMappingURL=setup-checker.js.map