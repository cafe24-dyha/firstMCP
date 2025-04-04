"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupManager = void 0;
const error_handler_1 = require("../../troubleshooting/scripts/error-handler");
const error_logger_1 = require("../../troubleshooting/scripts/error-logger");
const error_fixer_1 = require("../../troubleshooting/scripts/error-fixer");
class SetupManager {
    constructor(config) {
        this.config = config;
        this.errorHandler = new error_handler_1.ErrorHandler();
        this.errorLogger = new error_logger_1.ErrorLogger();
        this.errorFixer = new error_fixer_1.ErrorFixer();
    }
    async initialize() {
        try {
            // 환경 설정 초기화
            await this.initializeEnvironment();
            // 플러그인 관련 설정 확인
            if (this.config.isPlugin) {
                await this.setupPluginEnvironment();
            }
            // 에러 처리 시스템 초기화
            await this.initializeErrorHandling();
            console.log("✅ 피그마 셋업 초기화 완료");
        }
        catch (error) {
            await this.handleSetupError(error);
        }
    }
    async initializeEnvironment() {
        // tsconfig.json 설정 확인
        await this.validateTSConfig();
        // 필수 디렉토리 구조 확인
        await this.validateDirectoryStructure();
        // 의존성 패키지 확인
        await this.validateDependencies();
    }
    async setupPluginEnvironment() {
        // 플러그인 관련 타입 정의 확인
        await this.validatePluginTypes();
        // UI 컴포넌트 설정 확인
        await this.validateUIComponents();
        // 메시지 핸들링 설정 확인
        await this.validateMessageHandling();
    }
    async initializeErrorHandling() {
        // 에러 로깅 시스템 초기화
        await this.errorLogger.initialize({
            logDirectory: "src/utils-mcp/troubleshooting/docs",
            historyLimit: 100,
        });
        // 에러 처리 규칙 설정
        await this.errorHandler.setRules({
            autoFix: true,
            notifyOnError: true,
            logToFile: true,
        });
        // 자동 수정 규칙 설정
        await this.errorFixer.setRules({
            maxAttempts: 3,
            fixTimeout: 5000,
        });
    }
    async handleSetupError(error) {
        try {
            // 에러 로깅
            await this.errorLogger.logError({
                type: "SETUP_ERROR",
                message: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
                context: {
                    config: this.config,
                    stackTrace: error instanceof Error ? error.stack : undefined,
                },
            });
            // 자동 수정 시도
            const fixed = await this.errorFixer.attemptFix({
                error,
                context: {
                    setupConfig: this.config,
                },
            });
            if (!fixed) {
                console.error("❌ 피그마 셋업 초기화 실패:", error);
                throw error;
            }
        }
        catch (loggingError) {
            console.error("❌ 에러 처리 중 추가 오류 발생:", loggingError);
            throw loggingError;
        }
    }
    async validateTSConfig() {
        // tsconfig.json 설정 검증
        const requiredSettings = {
            types: ["@figma/plugin-typings"],
            target: "es2017",
            moduleResolution: "node",
        };
        // 설정 검증 로직 구현
    }
    async validateDirectoryStructure() {
        // 필수 디렉토리 구조 검증
        const requiredDirs = [
            "src/utils-mcp/figma-setup",
            "src/utils-mcp/troubleshooting",
            "src/ui",
        ];
        // 디렉토리 구조 검증 로직 구현
    }
    async validateDependencies() {
        // 필수 의존성 패키지 검증
        const requiredDeps = [
            "@figma/plugin-typings",
            "typescript",
            "react",
            "react-dom",
        ];
        // 의존성 검증 로직 구현
    }
    async validatePluginTypes() {
        // 플러그인 타입 정의 검증
        const requiredTypes = ["UIMessage", "ErrorMessage", "ComponentProperties"];
        // 타입 정의 검증 로직 구현
    }
    async validateUIComponents() {
        // UI 컴포넌트 설정 검증
        const requiredComponents = ["App.tsx", "index.tsx"];
        // UI 컴포넌트 검증 로직 구현
    }
    async validateMessageHandling() {
        // 메시지 핸들링 설정 검증
        const requiredHandlers = ["onmessage", "postMessage"];
        // 메시지 핸들링 검증 로직 구현
    }
}
exports.SetupManager = SetupManager;
//# sourceMappingURL=setup-manager.js.map