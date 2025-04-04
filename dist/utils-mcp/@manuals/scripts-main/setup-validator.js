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
exports.setupValidator = exports.SetupValidator = void 0;
const logger_1 = require("./logger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SetupValidator {
    constructor() {
        this.logger = logger_1.Logger.getInstance();
        this.configPath = path.join(process.cwd(), 'config.json');
    }
    static getInstance() {
        if (!SetupValidator.instance) {
            SetupValidator.instance = new SetupValidator();
        }
        return SetupValidator.instance;
    }
    async validate() {
        try {
            this.logger.debug('설정 검증 시작');
            if (!fs.existsSync(this.configPath)) {
                throw new Error('설정 파일이 없습니다.');
            }
            const configContent = await fs.promises.readFile(this.configPath, 'utf-8');
            const config = JSON.parse(configContent);
            this.validateRequiredFields(config);
            this.validateConfigValues(config);
            this.logger.info('설정 검증 완료');
        }
        catch (error) {
            this.logger.error('설정 검증 중 오류 발생', { error });
            throw error;
        }
    }
    validateRequiredFields(config) {
        const requiredFields = ['templates', 'output', 'logging'];
        const missingFields = requiredFields.filter((field) => !(field in config));
        if (missingFields.length > 0) {
            throw new Error(`필수 설정이 누락되었습니다: ${missingFields.join(', ')}`);
        }
    }
    validateConfigValues(config) {
        if (config.templates) {
            const templates = config.templates;
            for (const [key, value] of Object.entries(templates)) {
                if (!value || typeof value !== 'string') {
                    throw new Error(`잘못된 템플릿 설정: ${key}`);
                }
            }
        }
        if (config.output) {
            const output = config.output;
            if (output.dir && typeof output.dir !== 'string') {
                throw new Error('잘못된 출력 디렉토리 설정');
            }
            if (output.backup !== undefined && typeof output.backup !== 'boolean') {
                throw new Error('잘못된 백업 설정');
            }
        }
        if (config.logging) {
            const logging = config.logging;
            if (logging.level && !['debug', 'info', 'warn', 'error'].includes(logging.level)) {
                throw new Error('잘못된 로깅 레벨 설정');
            }
            if (logging.file && typeof logging.file !== 'string') {
                throw new Error('잘못된 로그 파일 설정');
            }
        }
    }
}
exports.SetupValidator = SetupValidator;
SetupValidator.instance = null;
exports.setupValidator = SetupValidator.getInstance();
//# sourceMappingURL=setup-validator.js.map