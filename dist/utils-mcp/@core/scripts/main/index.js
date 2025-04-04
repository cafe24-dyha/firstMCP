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
const automation_controller_1 = require("../control/automation-controller");
const communication_controller_1 = require("../control/communication-controller");
const path = __importStar(require("path"));
class MCPRunner {
    constructor(config) {
        this.config = config;
        this.automationController = new automation_controller_1.AutomationController(config.rootDir);
        this.communicationController = new communication_controller_1.CommunicationController();
        this.setupCommunication();
        this.setupLogging();
    }
    setupCommunication() {
        this.communicationController.setSyncConfig({
            interval: this.config.syncInterval,
            strategy: "immediate",
        });
    }
    setupLogging() {
        const logLevels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        const log = (level, message, ...args) => {
            if (logLevels[level] >= logLevels[this.config.logLevel]) {
                const timestamp = new Date().toISOString();
                console[level](`[${timestamp}] ${message}`, ...args);
            }
        };
        global.console = {
            ...console,
            debug: (message, ...args) => log("debug", message, ...args),
            info: (message, ...args) => log("info", message, ...args),
            warn: (message, ...args) => log("warn", message, ...args),
            error: (message, ...args) => log("error", message, ...args),
        };
    }
    async start() {
        try {
            console.log("=== MCP 중앙 관제 시스템 시작 ===");
            console.log(`실행 시간: ${new Date().toLocaleString()}`);
            console.log(`루트 디렉토리: ${this.config.rootDir}`);
            console.log("================================");
            // 자동화 시스템 시작
            await this.automationController.startMonitoring();
            // 통신 시스템 시작
            await this.communicationController.startMonitoring(this.config.rootDir);
            // 신규 아이템 생성 예제
            await this.createNewItem("figma-automation");
            console.log("=== 시스템 실행 중 ===");
            console.log("종료하려면 Ctrl+C를 누르세요.");
        }
        catch (error) {
            console.error("시스템 시작 오류:", error);
            process.exit(1);
        }
    }
    async createNewItem(itemName) {
        try {
            await this.automationController.createNewItem(itemName);
            console.log(`새 아이템 생성됨: ${itemName}`);
        }
        catch (error) {
            console.error("아이템 생성 오류:", error);
        }
    }
    stop() {
        this.communicationController.stopMonitoring();
        console.log("시스템이 종료되었습니다.");
    }
}
// 실행 예제
const config = {
    rootDir: path.join(__dirname, "../.."),
    syncInterval: 5000,
    logLevel: "info",
};
const runner = new MCPRunner(config);
// 종료 시그널 처리
process.on("SIGINT", () => {
    runner.stop();
    process.exit(0);
});
// 시스템 시작
runner.start().catch(console.error);
//# sourceMappingURL=index.js.map