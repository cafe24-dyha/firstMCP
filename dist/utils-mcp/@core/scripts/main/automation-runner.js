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
exports.AutomationRunner = void 0;
const automation_control_1 = require("../control/automation-control");
const communication_control_1 = require("../control/communication-control");
const path = __importStar(require("path"));
class AutomationRunner {
    constructor(config) {
        this.config = config;
        this.automationControl = new automation_control_1.AutomationControl(config.rootDir);
        this.communicationControl = new communication_control_1.CommunicationControl();
        this.setupLogging();
        this.initializeControls();
    }
    setupLogging() {
        console.log(`[AutomationRunner] 초기화 시작 - ${new Date().toISOString()}`);
        console.log(`[AutomationRunner] 루트 디렉토리: ${this.config.rootDir}`);
    }
    async initializeControls() {
        try {
            // 통신 설정 초기화
            this.communicationControl.setSyncConfig({
                interval: this.config.syncInterval,
                strategy: "immediate",
            });
            // 디렉토리 구조 검증
            const isValid = await this.automationControl.validateItemStructure(this.config.rootDir);
            if (!isValid) {
                throw new Error("디렉토리 구조 검증 실패");
            }
            console.log("[AutomationRunner] 컨트롤 초기화 완료");
        }
        catch (error) {
            console.error("[AutomationRunner] 초기화 오류:", error);
            throw error;
        }
    }
    async start() {
        try {
            console.log("[AutomationRunner] 자동화 시스템 시작");
            // 매뉴얼 생성
            await this.automationControl.generateAllManuals();
            // 변경 감지 시작
            await Promise.all([
                this.automationControl.monitorChanges(),
                this.communicationControl.monitorChanges(this.config.rootDir),
            ]);
            console.log("[AutomationRunner] 변경 감지 시작됨");
        }
        catch (error) {
            console.error("[AutomationRunner] 시작 오류:", error);
            throw error;
        }
    }
    async validateAll() {
        try {
            const scriptsDir = path.join(this.config.rootDir, "scripts");
            // 스크립트 검증
            const scriptValid = await this.automationControl.validateScript(scriptsDir);
            if (!scriptValid) {
                console.warn("[AutomationRunner] 스크립트 검증 실패");
                return false;
            }
            // 디렉토리 구조 검증
            const structureValid = await this.automationControl.validateItemStructure(this.config.rootDir);
            if (!structureValid) {
                console.warn("[AutomationRunner] 디렉토리 구조 검증 실패");
                return false;
            }
            console.log("[AutomationRunner] 전체 검증 완료");
            return true;
        }
        catch (error) {
            console.error("[AutomationRunner] 검증 오류:", error);
            return false;
        }
    }
    getAutomationControl() {
        return this.automationControl;
    }
    getCommunicationControl() {
        return this.communicationControl;
    }
}
exports.AutomationRunner = AutomationRunner;
// 사용 예제
const config = {
    rootDir: path.join(__dirname, "../../"),
    syncInterval: 5000,
    logLevel: "info",
};
const runner = new AutomationRunner(config);
runner.start().catch(console.error);
//# sourceMappingURL=automation-runner.js.map