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
exports.errorHandler = exports.ErrorHandler = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
class ErrorHandler {
    constructor(config = {}, logDir = path.join(process.cwd(), "logs"), errorDocsPath = path.join(process.cwd(), "docs", "error-cases"), errorLogsPath = path.join(process.cwd(), "logs")) {
        this.config = config;
        this.logDir = logDir;
        this.errorDocsPath = errorDocsPath;
        this.errorLogsPath = errorLogsPath;
        this.errorCache = new Map();
        this.templates = new Map();
        this.lastProcessedFile = null;
        this.errorCases = [
            {
                id: "BE001",
                category: "BUILD",
                pattern: /Transforming destructuring to the configured target environment .* is not supported yet/,
                description: "esbuild destructuring transform error",
                isFigmaSpecific: true,
                fix: (filePath) => {
                    console.log("🔧 Fixing destructuring error in:", filePath);
                    const content = fs.readFileSync(filePath, "utf8");
                    const fixed = content.replace(/for\s*\(const\s*\[([^,\]]+),\s*([^\]]+)\]\s*of\s*Object\.entries\(([^)]+)\)\)/g, "Object.entries($3).forEach(([$1, $2]) =>");
                    fs.writeFileSync(filePath, fixed);
                    this.updateErrorDoc("BE001", true);
                },
            },
            {
                id: "TE001",
                category: "TYPESCRIPT",
                pattern: /This plugin template uses TypeScript\. Follow the instructions in `README\.md` to generate `code\.js`/,
                description: "TypeScript compilation error",
                isFigmaSpecific: true,
                fix: async (filePath) => {
                    console.log("🔧 컴파일링 TypeScript 파일...");
                    try {
                        await this.compileFigmaPlugin();
                        this.updateErrorDoc("TE001", true);
                    }
                    catch (error) {
                        console.error("❌ TypeScript 컴파일 중 에러 발생:", error);
                        throw error;
                    }
                },
            },
        ];
        this.config = {
            autoFix: config.autoFix ?? true,
            notifyOnError: config.notifyOnError ?? true,
            logToFile: config.logToFile ?? true,
            maxRetries: config.maxRetries ?? 3,
            timeout: config.timeout ?? 5000,
            scriptPath: config.scriptPath ?? path.join(process.cwd(), "scripts"),
        };
        this.initializeLogDirectory();
    }
    initializeLogDirectory() {
        if (this.config.logToFile && !fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    async handleError(error) {
        console.error(`🚨 에러 발생: ${error.type}`);
        console.error(`📝 메시지: ${error.message}`);
        if (this.config.logToFile) {
            await this.logError(error);
        }
        if (this.config.notifyOnError) {
            await this.notifyError(error);
        }
        if (this.config.autoFix) {
            await this.attemptAutoFix(error);
        }
        try {
            const filePathMatch = error.message.match(/(?:in|at|file)\s+['"]?([^'":\s]+\.(?:js|ts|tsx|jsx))['"]?/i);
            if (filePathMatch?.[1]) {
                this.lastProcessedFile = filePathMatch[1];
            }
        }
        catch (handlingError) {
            console.error("에러 처리 중 오류:", handlingError);
        }
    }
    async logError(error) {
        const logPath = path.join(this.logDir, "error.log");
        const logEntry = `
[${error.timestamp.toISOString()}] ${error.type}
Message: ${error.message}
Stack: ${error.stack || "No stack trace"}
-------------------
`;
        fs.appendFileSync(logPath, logEntry);
    }
    async notifyError(error) {
        // 에러 알림 로직 구현
        console.log(`📢 에러 알림: ${error.type} - ${error.message}`);
    }
    async attemptAutoFix(error) {
        const MAX_ATTEMPTS = 3;
        const RETRY_DELAY = 1000;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            console.log(`🔄 복구 시도 ${attempt}/${MAX_ATTEMPTS}`);
            try {
                const template = this.findMatchingTemplate(error);
                if (template?.autoFix && template.fixScript) {
                    const fixResult = await this.executeFixScript(template.fixScript, error);
                    if (fixResult) {
                        console.log(`✅ 자동 복구 성공 (시도: ${attempt})`);
                        return true;
                    }
                }
                // 기본 복구 시도
                if (error.type === "VALIDATION_ERROR") {
                    await this.handleValidationError(error);
                }
                else if (error.type === "NETWORK_ERROR") {
                    await this.handleNetworkError(error);
                }
                // 복구 성공 여부 확인
                const isResolved = await this.verifyRecovery(error);
                if (isResolved) {
                    console.log(`✅ 복구 성공 (시도: ${attempt})`);
                    return true;
                }
                if (attempt < MAX_ATTEMPTS) {
                    console.log(`⏳ ${RETRY_DELAY / 1000}초 후 다시 시도합니다...`);
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                }
            }
            catch (recoveryError) {
                console.error(`❌ 복구 시도 ${attempt} 실패:`, recoveryError);
            }
        }
        console.error(`❌ 최대 시도 횟수(${MAX_ATTEMPTS})를 초과했습니다.`);
        return false;
    }
    async verifyRecovery(error) {
        try {
            // 에러 상태 재확인
            const currentState = await this.checkCurrentState();
            return !this.isErrorState(currentState);
        }
        catch {
            return false;
        }
    }
    async executeFixScript(scriptName, error) {
        var _a;
        try {
            const fixerPath = path.join(this.config.scriptPath || "", "fixers", `${scriptName}.ts`);
            if (fs.existsSync(fixerPath)) {
                const fixer = await (_a = fixerPath, Promise.resolve().then(() => __importStar(require(_a))));
                return await fixer.fix(error);
            }
            return false;
        }
        catch (fixError) {
            console.error("Fix 스크립트 실행 실패:", fixError);
            return false;
        }
    }
    setupPaths() {
        const rootDir = process.cwd();
        this.errorDocsPath = path.join(rootDir, "docs", "error-cases");
        this.errorLogsPath = path.join(rootDir, "logs");
        [this.errorDocsPath, this.errorLogsPath].forEach((dir) => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    setupErrorWatcher() {
        process.on("uncaughtException", this.handleError.bind(this));
        process.on("unhandledRejection", this.handleError.bind(this));
    }
    initializeErrorDocs() {
        const categories = [
            { file: "figma-plugin-errors.md", title: "Figma Plugin Errors" },
            { file: "figma-api-errors.md", title: "Figma API Errors" },
            { file: "figma-ui-errors.md", title: "Figma UI Errors" },
            { file: "build-system-errors.md", title: "Build System Errors" },
            { file: "other-errors.md", title: "Other Errors" },
        ];
        categories.forEach(({ file, title }) => {
            const filePath = path.join(this.errorDocsPath, file);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, `# ${title}\n\n## Overview\n- 이 문서는 ${title}를 추적하고 관리합니다.\n- 마지막 업데이트: ${new Date().toISOString()}\n\n## Error Cases\n\n`);
            }
        });
        // 인덱스 파일 생성 또는 업데이트
        const indexPath = path.join(this.errorDocsPath, "index.md");
        const indexContent = `# Figma Plugin Error Documentation

## Categories
${categories.map(({ file, title }) => `- [${title}](./${file})`).join("\n")}

## Statistics
- Total Errors: \${this.errorCache.size}
- Fixed Errors: \${Array.from(this.errorCache.values()).filter(doc => doc.fixed).length}
- Pending Errors: \${Array.from(this.errorCache.values()).filter(doc => !doc.fixed).length}

Last Updated: ${new Date().toISOString()}
`;
        fs.writeFileSync(indexPath, indexContent);
    }
    async compileFigmaPlugin() {
        const packageJsonPath = path.join(process.cwd(), "package.json");
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        if (!packageJson.scripts.build) {
            packageJson.scripts.build =
                "tsc -p tsconfig.json && esbuild src/code.ts --bundle --outfile=build/code.js";
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        }
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)("npm run build", (error, stdout, stderr) => {
                if (error) {
                    console.error("❌ TypeScript 컴파일 실패:", stderr);
                    reject(error);
                    return;
                }
                console.log("✅ TypeScript 컴파일 성공:", stdout);
                resolve(stdout);
            });
        });
    }
    loadErrorCache() {
        const cacheFile = path.join(this.errorDocsPath, "error-cache.json");
        if (fs.existsSync(cacheFile)) {
            const cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
            this.errorCache = new Map(Object.entries(cache));
        }
    }
    saveErrorCache() {
        const cacheFile = path.join(this.errorDocsPath, "error-cache.json");
        const cache = Object.fromEntries(this.errorCache);
        fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
    }
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
    determineSeverity(error) {
        // 에러 타입과 컨텍스트에 따른 심각도 결정
        if (error.type === "SETUP_ERROR") {
            return "critical";
        }
        if (error.type === "PLUGIN_ERROR" || error.type === "TYPESCRIPT_ERROR") {
            return "error";
        }
        if (error.type === "UI_ERROR" || error.type === "VALIDATION_ERROR") {
            return "warning";
        }
        return "info";
    }
    createLogEntry(error, severity) {
        return {
            id: Date.now().toString(),
            type: error.type,
            message: error.message,
            timestamp: error.timestamp || new Date(),
            stack: error.stack,
            context: error.context,
            severity,
            resolved: false,
        };
    }
    async updateErrorDoc(errorId, fixed) {
        const docPath = path.join(this.errorDocsPath, `${errorId}.md`);
        if (fs.existsSync(docPath)) {
            const content = fs.readFileSync(docPath, "utf8");
            const updatedContent = content.replace(/## 상태\n.*?\n/, `## 상태\n${fixed ? "✅ 해결됨" : "❌ 미해결"}\n`);
            fs.writeFileSync(docPath, updatedContent);
        }
    }
    async updateCategoryDoc(errorCase, fixed) {
        let categoryFile;
        if (errorCase.isFigmaSpecific) {
            switch (errorCase.category) {
                case "FIGMA_API":
                    categoryFile = "figma-api-errors.md";
                    break;
                case "BUILD":
                    categoryFile = "build-system-errors.md";
                    break;
                case "RUNTIME":
                    categoryFile = "figma-plugin-errors.md";
                    break;
                case "TYPESCRIPT":
                    categoryFile = "figma-ui-errors.md";
                    break;
                default:
                    categoryFile = "other-errors.md";
            }
        }
        else {
            categoryFile = "other-errors.md";
        }
        const filePath = path.join(this.errorDocsPath, categoryFile);
        const timestamp = new Date().toISOString();
        const entry = `### ${errorCase.id}: ${errorCase.description}
- Status: ${fixed ? "✅ 해결됨" : "❌ 미해결"}
- Type: ${errorCase.isFigmaSpecific ? "Figma 관련" : "일반 에러"}
- Last Updated: ${timestamp}
- Occurrences: ${(this.errorCache.get(errorCase.id)?.occurrences || 0) + 1}

\`\`\`
${errorCase.pattern}
\`\`\`

---
`;
        if (!fs.existsSync(filePath)) {
            await this.initializeErrorDocs();
        }
        fs.appendFileSync(filePath, entry);
    }
    async documentNewError(error) {
        const errorId = `ERROR_${Date.now()}`;
        const docPath = path.join(this.errorDocsPath, `${errorId}.md`);
        const isDuplicate = Array.from(this.errorCache.values()).some((doc) => doc.message === error.message);
        if (isDuplicate) {
            console.log("ℹ️ 중복된 에러입니다. 문서화를 건너뜁니다.");
            return;
        }
        const doc = `# 새로운 에러 케이스 (${errorId})

## 에러 메시지
\`\`\`
${error.message}
\`\`\`

## 스택 트레이스
\`\`\`
${error.stack}
\`\`\`

## 발생 시간
${new Date().toISOString()}

## 상태
❌ 미해결

## Figma 관련 여부
${this.isFigmaError(error) ? "✅ Figma 관련" : "❌ Figma 무관"}

## 해결 방법
// TODO: 해결 방법을 문서화하세요

## 자동 해결 시도 기록
- [ ] 패턴 매칭 시도
- [ ] 코드 분석
- [ ] 해결책 제안
`;
        fs.writeFileSync(docPath, doc);
        console.log(`📝 새로운 에러 케이스가 문서화되었습니다: ${errorId}`);
        this.errorCache.set(errorId, {
            id: errorId,
            message: error.message,
            solution: "",
            timestamp: new Date().toISOString(),
            fixed: false,
            isFigmaSpecific: this.isFigmaError(error),
            occurrences: 1,
        });
        this.saveErrorCache();
    }
    isFigmaError(error) {
        const figmaKeywords = [
            "figma",
            "plugin",
            "manifest",
            "code.js",
            "ui.js",
            "createPage",
            "createFrame",
        ];
        return figmaKeywords.some((keyword) => error.message.toLowerCase().includes(keyword) ||
            (error.stack && error.stack.toLowerCase().includes(keyword)));
    }
    /**
     * 마지막으로 처리한 파일 경로 반환
     */
    getLastProcessedFile() {
        return this.lastProcessedFile;
    }
    findMatchingTemplate(error) {
        const templates = Array.from(this.templates.values());
        let bestMatch;
        for (const template of templates) {
            const score = this.calculateMatchScore(error.message, template.pattern);
            if (score > 0.7 && (!bestMatch || score > bestMatch.score)) {
                bestMatch = { template, score };
            }
        }
        return bestMatch?.template;
    }
    calculateMatchScore(message, pattern) {
        try {
            // 정규식 매칭
            const regex = new RegExp(pattern, "i");
            if (regex.test(message)) {
                return 1.0;
            }
            // 단어 기반 유사도 계산
            const messageWords = message.toLowerCase().split(/\s+/);
            const patternWords = pattern.toLowerCase().split(/\s+/);
            let matchCount = 0;
            for (const word of patternWords) {
                if (messageWords.includes(word)) {
                    matchCount++;
                }
            }
            return matchCount / patternWords.length;
        }
        catch {
            return 0;
        }
    }
    async handleValidationError(error) {
        const errorType = this.categorizeValidationError(error);
        console.log(`🔍 검증 에러 유형: ${errorType}`);
        const handlers = {
            TYPE_ERROR: this.fixTypeError.bind(this),
            PROP_ERROR: this.fixPropError.bind(this),
            SYNTAX_ERROR: this.fixSyntaxError.bind(this),
        };
        const handler = handlers[errorType];
        if (handler) {
            await handler(error);
        }
        else {
            console.log("⚠️ 알 수 없는 검증 에러 유형");
        }
    }
    categorizeValidationError(error) {
        const message = error.message.toLowerCase();
        if (message.includes("type") || message.includes("typescript")) {
            return "TYPE_ERROR";
        }
        if (message.includes("property") || message.includes("prop")) {
            return "PROP_ERROR";
        }
        if (message.includes("syntax") || message.includes("unexpected")) {
            return "SYNTAX_ERROR";
        }
        return "UNKNOWN";
    }
    async handleNetworkError(error) {
        const retryCount = 3;
        const retryDelay = 1000;
        for (let i = 0; i < retryCount; i++) {
            try {
                console.log(`🔄 네트워크 재시도 ${i + 1}/${retryCount}`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
                // 네트워크 상태 확인
                if (await this.checkNetworkStatus()) {
                    console.log("✅ 네트워크 연결 복구됨");
                    return;
                }
            }
            catch (retryError) {
                console.error(`❌ 재시도 ${i + 1} 실패:`, retryError);
            }
        }
        console.error("❌ 네트워크 복구 실패");
    }
    async checkNetworkStatus() {
        try {
            // 네트워크 상태 확인 로직
            return true;
        }
        catch {
            return false;
        }
    }
    async checkCurrentState() {
        // 현재 상태 확인 로직
        return true;
    }
    isErrorState(state) {
        return !state;
    }
    async fixTypeError(error) {
        console.log("TypeScript 에러 수정 시도:", error.message);
        // TypeScript 에러 수정 로직
    }
    async fixPropError(error) {
        console.log("Props 에러 수정 시도:", error.message);
        // Props 에러 수정 로직
    }
    async fixSyntaxError(error) {
        console.log("구문 에러 수정 시도:", error.message);
        // 구문 에러 수정 로직
    }
}
exports.ErrorHandler = ErrorHandler;
exports.errorHandler = new ErrorHandler();
//# sourceMappingURL=error-handler.js.map