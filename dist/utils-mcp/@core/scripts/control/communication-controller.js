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
exports.CommunicationController = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class CommunicationController {
    constructor() {
        this.eventEmitter = new events_1.EventEmitter();
        this.eventHistory = [];
        this.syncConfig = {
            interval: 5000,
            strategy: "immediate",
            retryCount: 3,
        };
        this.isMonitoring = false;
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        // 아이템 변경 이벤트
        this.eventEmitter.on("itemChange", async (data) => {
            const event = {
                type: "itemChange",
                source: data.source,
                target: data.target,
                data: data.content,
                timestamp: new Date(),
            };
            this.eventHistory.push(event);
            await this.handleItemChange(event);
        });
        // 매뉴얼 업데이트 이벤트
        this.eventEmitter.on("manualUpdate", async (data) => {
            const event = {
                type: "manualUpdate",
                source: data.source,
                data: data.content,
                timestamp: new Date(),
            };
            this.eventHistory.push(event);
            await this.handleManualUpdate(event);
        });
        // 스크립트 업데이트 이벤트
        this.eventEmitter.on("scriptUpdate", async (data) => {
            const event = {
                type: "scriptUpdate",
                source: data.source,
                data: data.content,
                timestamp: new Date(),
            };
            this.eventHistory.push(event);
            await this.handleScriptUpdate(event);
        });
    }
    async handleItemChange(event) {
        try {
            // 의존성 있는 아이템들에게 알림
            if (event.target) {
                await this.notifyDependentItems(event.target, event.data);
            }
            // 상태 동기화
            if (this.syncConfig.strategy === "immediate") {
                await this.synchronizeState(event.source);
            }
        }
        catch (error) {
            console.error("아이템 변경 처리 오류:", error);
            throw error;
        }
    }
    async handleManualUpdate(event) {
        try {
            const manualPath = event.data.path;
            // 매뉴얼 파일 업데이트
            if (manualPath.startsWith("templates-manuals")) {
                await this.updateManualFile(manualPath, event.data.content);
            }
        }
        catch (error) {
            console.error("매뉴얼 업데이트 처리 오류:", error);
            throw error;
        }
    }
    async handleScriptUpdate(event) {
        try {
            const scriptPath = event.data.path;
            // 스크립트 파일 업데이트
            await this.updateScriptFile(scriptPath, event.data.content);
            // 의존성 검사
            await this.validateDependencies(scriptPath);
        }
        catch (error) {
            console.error("스크립트 업데이트 처리 오류:", error);
            throw error;
        }
    }
    async notifyDependentItems(targetItem, data) {
        // 의존성 있는 아이템들에게 변경 사항 알림
        const dependentItems = await this.findDependentItems(targetItem);
        for (const item of dependentItems) {
            this.eventEmitter.emit("itemChange", {
                source: targetItem,
                target: item,
                content: data,
            });
        }
    }
    async findDependentItems(itemPath) {
        // 의존성 있는 아이템 찾기
        const dependentItems = [];
        const rootDir = path.dirname(itemPath);
        try {
            const items = await fs.readdir(rootDir);
            for (const item of items) {
                const itemDir = path.join(rootDir, item);
                const stats = await fs.stat(itemDir);
                if (stats.isDirectory()) {
                    // 의존성 파일 확인
                    const dependencyFile = path.join(itemDir, "dependencies.json");
                    try {
                        const content = await fs.readFile(dependencyFile, "utf-8");
                        const dependencies = JSON.parse(content);
                        if (dependencies.includes(path.basename(itemPath))) {
                            dependentItems.push(itemDir);
                        }
                    }
                    catch (error) {
                        // 의존성 파일이 없는 경우 무시
                    }
                }
            }
        }
        catch (error) {
            console.error("의존성 검색 오류:", error);
        }
        return dependentItems;
    }
    async synchronizeState(itemPath) {
        try {
            // 상태 파일 읽기
            const statePath = path.join(itemPath, "state.json");
            const content = await fs.readFile(statePath, "utf-8");
            const state = JSON.parse(content);
            // 상태 검증
            const isValid = await this.validateState(state);
            if (!isValid) {
                throw new Error("상태 검증 실패");
            }
            console.log(`상태 동기화 완료: ${itemPath}`);
        }
        catch (error) {
            console.error("상태 동기화 오류:", error);
            throw error;
        }
    }
    async validateState(state) {
        // 상태 유효성 검사
        return true; // 임시 구현
    }
    async updateManualFile(manualPath, content) {
        try {
            await fs.writeFile(manualPath, content, "utf-8");
            console.log(`매뉴얼 업데이트 완료: ${manualPath}`);
        }
        catch (error) {
            console.error("매뉴얼 파일 업데이트 오류:", error);
            throw error;
        }
    }
    async updateScriptFile(scriptPath, content) {
        try {
            await fs.writeFile(scriptPath, content, "utf-8");
            console.log(`스크립트 업데이트 완료: ${scriptPath}`);
        }
        catch (error) {
            console.error("스크립트 파일 업데이트 오류:", error);
            throw error;
        }
    }
    async validateDependencies(scriptPath) {
        try {
            const content = await fs.readFile(scriptPath, "utf-8");
            // 의존성 패턴 검사
            const importPattern = /import.*from\s+['"](.+)['"]/g;
            const matches = content.matchAll(importPattern);
            for (const match of matches) {
                const dependency = match[1];
                if (!(await this.checkDependencyExists(dependency, scriptPath))) {
                    console.warn(`누락된 의존성: ${dependency} in ${scriptPath}`);
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            console.error("의존성 검증 오류:", error);
            return false;
        }
    }
    async checkDependencyExists(dependency, sourcePath) {
        try {
            const basePath = path.dirname(sourcePath);
            const dependencyPath = path.resolve(basePath, dependency);
            await fs.access(dependencyPath);
            return true;
        }
        catch {
            return false;
        }
    }
    setSyncConfig(config) {
        this.syncConfig = { ...this.syncConfig, ...config };
    }
    async startMonitoring(rootDir) {
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        console.log("통신 모니터링 시작");
        const monitor = async () => {
            if (!this.isMonitoring)
                return;
            try {
                // 상태 동기화
                if (this.syncConfig.strategy === "interval") {
                    const items = await fs.readdir(rootDir);
                    for (const item of items) {
                        const itemPath = path.join(rootDir, item);
                        const stats = await fs.stat(itemPath);
                        if (stats.isDirectory()) {
                            await this.synchronizeState(itemPath);
                        }
                    }
                }
                // 다음 모니터링 예약
                setTimeout(monitor, this.syncConfig.interval);
            }
            catch (error) {
                console.error("모니터링 오류:", error);
                this.isMonitoring = false;
            }
        };
        monitor();
    }
    stopMonitoring() {
        this.isMonitoring = false;
        console.log("통신 모니터링 중지");
    }
    getEventHistory() {
        return [...this.eventHistory];
    }
}
exports.CommunicationController = CommunicationController;
//# sourceMappingURL=communication-controller.js.map