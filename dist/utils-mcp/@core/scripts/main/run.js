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
const automation_runner_1 = require("./automation-runner");
const path = __importStar(require("path"));
async function main() {
    try {
        const config = {
            rootDir: path.join(__dirname, "../../"),
            syncInterval: 5000,
            logLevel: "info",
        };
        console.log("=== Utils-MCP 자동화 시스템 시작 ===");
        console.log(`실행 시간: ${new Date().toLocaleString()}`);
        console.log(`루트 디렉토리: ${config.rootDir}`);
        console.log("================================");
        const runner = new automation_runner_1.AutomationRunner(config);
        // 전체 검증 실행
        const isValid = await runner.validateAll();
        if (!isValid) {
            throw new Error("시스템 검증 실패");
        }
        // 자동화 시스템 시작
        await runner.start();
        console.log("=== 자동화 시스템 실행 중 ===");
        console.log("종료하려면 Ctrl+C를 누르세요.");
    }
    catch (error) {
        console.error("오류 발생:", error);
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=run.js.map