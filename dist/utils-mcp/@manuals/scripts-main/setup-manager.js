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
exports.setupManager = exports.SetupManager = void 0;
const logger_1 = require("./logger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SetupManager {
    constructor() {
        this.logger = logger_1.Logger.getInstance();
        this.config = {};
        this.configPath = path.join(process.cwd(), 'config.json');
    }
    static getInstance() {
        if (!SetupManager.instance) {
            SetupManager.instance = new SetupManager();
        }
        return SetupManager.instance;
    }
    async apply() {
        try {
            this.logger.debug('설정 적용 시작');
            if (!fs.existsSync(this.configPath)) {
                this.logger.warn('설정 파일이 없습니다. 기본 설정을 생성합니다.');
                await this.createDefaultConfig();
            }
            const config = await this.loadConfig();
            this.logger.debug('설정 로드 완료', { config });
            await this.applyConfig(config);
            this.logger.info('설정 적용 완료');
        }
        catch (error) {
            this.logger.error('설정 적용 중 오류 발생', { error });
            throw error;
        }
    }
    async createDefaultConfig() {
        const defaultConfig = {
            templates: {
                main: 'main.md',
                control: 'control.md',
            },
            output: {
                dir: 'output',
                backup: true,
            },
            logging: {
                level: 'info',
                file: 'logs/manual-generator.log',
            },
        };
        await fs.promises.writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2));
    }
    async loadConfig() {
        const configContent = await fs.promises.readFile(this.configPath, 'utf-8');
        return JSON.parse(configContent);
    }
    async applyConfig(config) {
        if (config.templates) {
            const templates = config.templates;
            for (const [key, value] of Object.entries(templates)) {
                this.logger.debug(`템플릿 설정 적용: ${key}=${value}`);
            }
        }
        if (config.output) {
            const output = config.output;
            if (output.dir) {
                const outputDir = path.join(process.cwd(), output.dir);
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
            }
        }
        if (config.logging) {
            const logging = config.logging;
            if (logging.level) {
                this.logger.setLogLevel(logging.level);
            }
        }
    }
    async saveConfig(config) {
        try {
            const configContent = JSON.stringify(config, null, 2);
            await fs.promises.writeFile(this.configPath, configContent, 'utf-8');
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`설정 저장 실패: ${error.message}`);
            }
            throw new Error('설정 저장 실패: 알 수 없는 오류');
        }
    }
    async validateConfig(config) {
        try {
            const requiredFields = [
                'targetDir',
                'scriptsDir',
                'manualsDir',
                'templatesDir',
                'backupDir',
                'logsDir',
            ];
            for (const field of requiredFields) {
                if (!config[field]) {
                    throw new Error(`필수 설정 누락: ${field}`);
                }
            }
            await this.checkDirectories(config);
            return true;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`설정 검증 실패: ${error.message}`);
            }
            throw new Error('설정 검증 실패: 알 수 없는 오류');
        }
    }
    async checkDirectories(config) {
        const directories = [
            config.targetDir,
            config.scriptsDir,
            config.manualsDir,
            config.templatesDir,
            config.backupDir,
            config.logsDir,
        ];
        for (const dir of directories) {
            try {
                await fs.promises.access(dir);
            }
            catch (_a) {
                await fs.promises.mkdir(dir, { recursive: true });
            }
        }
    }
    getConfig() {
        return this.config;
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
}
exports.SetupManager = SetupManager;
SetupManager.instance = null;
exports.setupManager = SetupManager.getInstance();
//# sourceMappingURL=setup-manager.js.map