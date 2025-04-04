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
exports.mcpErrorIntegration = void 0;
const error_handler_1 = require("./scripts/error-handler");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MCPErrorIntegration {
    constructor() {
        this.loadConfig();
        this.setupMCPIntegration();
    }
    loadConfig() {
        const configPath = path.join(process.cwd(), "mcp-config.json");
        this.config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
    setupMCPIntegration() {
        if (!this.config.mcp.automation.errorHandling.enabled) {
            return;
        }
        // MCP 브라우저 도구와 통합
        this.setupBrowserToolsIntegration();
        // 에러 감지 및 처리
        this.setupErrorDetection();
        // 자동 문서화 설정
        this.setupAutomaticDocumentation();
    }
    setupBrowserToolsIntegration() {
        // 콘솔 에러 감지
        process.on("message", async (message) => {
            if (message.type === "browser-error") {
                await error_handler_1.errorHandler.handleError(new Error(message.error));
            }
        });
    }
    setupErrorDetection() {
        // 빌드 에러 감지
        process.on("exit", (code) => {
            if (code !== 0) {
                const error = new Error(`Build failed with exit code: ${code}`);
                error_handler_1.errorHandler.handleError(error);
            }
        });
        // TypeScript 컴파일러 에러 감지
        if (process.env.TS_NODE_PROJECT) {
            require("ts-node").register({
                project: process.env.TS_NODE_PROJECT,
                transpileOnly: true,
                compilerOptions: {
                    module: "commonjs",
                },
                errorHandler: (error) => {
                    error_handler_1.errorHandler.handleError(error);
                },
            });
        }
    }
    setupAutomaticDocumentation() {
        const docPath = this.config.mcp.automation.errorHandling.documentation.path;
        // 자동 문서화 디렉토리 생성
        if (!fs.existsSync(docPath)) {
            fs.mkdirSync(docPath, { recursive: true });
        }
        // 카테고리별 문서 초기화
        this.config.mcp.automation.errorHandling.documentation.categories.forEach((category) => {
            const categoryPath = path.join(docPath, `${category}.md`);
            if (!fs.existsSync(categoryPath)) {
                const template = `# ${category
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}\n\n## 자동 생성된 에러 문서\n\n`;
                fs.writeFileSync(categoryPath, template);
            }
        });
    }
    async handleMCPError(error) {
        if (this.config.mcp.automation.errorHandling.autoFix) {
            await error_handler_1.errorHandler.handleError(error);
        }
    }
}
exports.mcpErrorIntegration = new MCPErrorIntegration();
//# sourceMappingURL=mcp-error-integration.js.map