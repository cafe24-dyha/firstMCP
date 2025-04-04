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
exports.FigmaSetupValidator = void 0;
const error_handler_1 = require("../../troubleshooting/scripts/error-handler");
class FigmaSetupValidator extends error_handler_1.BaseErrorHandler {
    constructor(config, projectRoot) {
        super();
        this.config = config;
        this.projectRoot = projectRoot;
    }
    // 환경 검증
    async validateEnvironment() {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        // Node.js 버전 검증
        const nodeVersion = process.version;
        if (!this.checkVersion(nodeVersion, ">=18.0.0")) {
            result.errors.push("Node.js v18 이상이 필요합니다");
            result.isValid = false;
        }
        return result;
    }
    // 프로젝트 구조 검증
    async validateStructure() {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        const requiredFiles = [
            "package.json",
            "manifest.json",
            "tsconfig.json",
            "src/code.ts",
            "src/ui.tsx",
        ];
        for (const file of requiredFiles) {
            if (!(await this.fileExists(file))) {
                result.errors.push(`필수 파일 ${file}이(가) 없습니다`);
                result.isValid = false;
            }
        }
        return result;
    }
    // manifest.json 검증
    async validateManifest() {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        const requiredFields = ["name", "id", "api", "main", "ui"];
        for (const field of requiredFields) {
            if (!this.config[field]) {
                result.errors.push(`manifest.json에 ${field} 필드가 없습니다`);
                result.isValid = false;
            }
        }
        return result;
    }
    // 유틸리티 메서드
    async fileExists(path) {
        try {
            await Promise.resolve().then(() => __importStar(require("fs"))).then((fs) => fs.promises.access(path));
            return true;
        }
        catch {
            return false;
        }
    }
    checkVersion(version, requirement) {
        // semver 비교 로직 구현
        return true; // 실제 구현 필요
    }
    // 전체 검증 실행
    async validateAll() {
        const results = await Promise.all([
            this.validateEnvironment(),
            this.validateStructure(),
            this.validateManifest(),
        ]);
        return results.reduce((acc, curr) => ({
            isValid: acc.isValid && curr.isValid,
            errors: [...acc.errors, ...curr.errors],
            warnings: [...acc.warnings, ...curr.warnings],
        }), { isValid: true, errors: [], warnings: [] });
    }
}
exports.FigmaSetupValidator = FigmaSetupValidator;
//# sourceMappingURL=setup-validator.js.map