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
exports.CommunicationControl = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs/promises"));
class CommunicationControl {
    constructor() {
        this.eventEmitter = new events_1.EventEmitter();
        this.eventLog = [];
        this.syncConfig = {
            interval: 5000,
            strategy: "immediate",
        };
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        // 아이템 변경 이벤트
        this.eventEmitter.on("itemChange", (event) => {
            this.logEvent(event);
            this.handleItemChange(event);
        });
        // 매뉴얼 업데이트 이벤트
        this.eventEmitter.on("manualUpdate", (event) => {
            this.logEvent(event);
            this.handleManualUpdate(event);
        });
        // 스크립트 업데이트 이벤트
        this.eventEmitter.on("scriptUpdate", (event) => {
            this.logEvent(event);
            this.handleScriptUpdate(event);
        });
    }
    logEvent(event) {
        this.eventLog.push({
            ...event,
            timestamp: Date.now(),
        });
        // 이벤트 로그 크기 제한
        if (this.eventLog.length > 1000) {
            this.eventLog = this.eventLog.slice(-1000);
        }
    }
    async handleItemChange(event) {
        try {
            // 변경된 아이템의 의존성 확인
            const dependencies = await this.checkDependencies(event.source);
            // 의존성이 있는 아이템들에 대한 업데이트 알림
            for (const dep of dependencies) {
                this.notifyDependentItem(dep, event);
            }
            // 상태 동기화
            if (this.syncConfig.strategy === "immediate") {
                await this.synchronizeState(event.source);
            }
        }
        catch (error) {
            console.error("Error handling item change:", error);
        }
    }
    async handleManualUpdate(event) {
        try {
            const manualPath = event.data.manualPath;
            // 매뉴얼 유효성 검사
            await this.validateManual(manualPath);
            // 연관된 매뉴얼 업데이트
            await this.updateRelatedManuals(manualPath);
        }
        catch (error) {
            console.error("Error handling manual update:", error);
        }
    }
    async handleScriptUpdate(event) {
        try {
            const scriptPath = event.data.scriptPath;
            // 스크립트 유효성 검사
            await this.validateScript(scriptPath);
            // 관련 매뉴얼 업데이트
            await this.updateScriptManual(scriptPath);
        }
        catch (error) {
            console.error("Error handling script update:", error);
        }
    }
    async checkDependencies(itemPath) {
        // TODO: 의존성 체크 로직 구현
        return [];
    }
    notifyDependentItem(itemPath, event) {
        this.eventEmitter.emit("dependencyUpdate", {
            type: "dependencyUpdate",
            source: event.source,
            target: itemPath,
            data: event.data,
            timestamp: Date.now(),
        });
    }
    async synchronizeState(itemPath) {
        // TODO: 상태 동기화 로직 구현
    }
    async validateManual(manualPath) {
        try {
            const content = await fs.readFile(manualPath, "utf-8");
            // 기본 구조 검증
            const requiredSections = ["## 설명", "## 기능", "## 사용법"];
            for (const section of requiredSections) {
                if (!content.includes(section)) {
                    console.warn(`Warning: Manual ${manualPath} missing required section: ${section}`);
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            console.error("Error validating manual:", error);
            return false;
        }
    }
    async validateScript(scriptPath) {
        try {
            const content = await fs.readFile(scriptPath, "utf-8");
            // 기본 구조 검증
            const requiredPatterns = [
                /export\s+class/,
                /constructor/,
                /async\s+execute/,
            ];
            for (const pattern of requiredPatterns) {
                if (!pattern.test(content)) {
                    console.warn(`Warning: Script ${scriptPath} missing required pattern: ${pattern}`);
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            console.error("Error validating script:", error);
            return false;
        }
    }
    async updateRelatedManuals(manualPath) {
        // TODO: 연관 매뉴얼 업데이트 로직 구현
    }
    async updateScriptManual(scriptPath) {
        // TODO: 스크립트 매뉴얼 업데이트 로직 구현
    }
    getEventLog() {
        return this.eventLog;
    }
    setSyncConfig(config) {
        this.syncConfig = {
            ...this.syncConfig,
            ...config,
        };
    }
    async monitorChanges(rootDir) {
        const watcher = require("chokidar").watch(rootDir, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
        });
        watcher
            .on("add", (path) => {
            this.eventEmitter.emit("itemChange", {
                type: "itemChange",
                source: path,
                data: { type: "add" },
                timestamp: Date.now(),
            });
        })
            .on("change", (path) => {
            this.eventEmitter.emit("itemChange", {
                type: "itemChange",
                source: path,
                data: { type: "change" },
                timestamp: Date.now(),
            });
        });
    }
}
exports.CommunicationControl = CommunicationControl;
//# sourceMappingURL=communication-control.js.map