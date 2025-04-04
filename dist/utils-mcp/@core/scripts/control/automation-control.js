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
exports.AutomationControl = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const manual_generator_1 = require("./manual-generator");
class AutomationControl {
    constructor(rootDir) {
        this.rootDir = rootDir;
        this.eventEmitter = new events_1.EventEmitter();
        this.manualGenerator = new manual_generator_1.ManualGenerator(rootDir);
        this.principles = {
            naming: {
                pattern: "^[a-z-]+\\.(ts|md|json)$",
                rules: ["소문자와 하이픈만 사용", "확장자는 .ts, .md 또는 .json"],
            },
            directory: {
                structure: ["scripts", "templates", "manuals"],
                conventions: ["기능별 디렉터리 분리", "공통 컴포넌트는 common에 위치"],
            },
            communication: {
                protocol: "event-based",
                events: ["itemChange", "manualUpdate", "scriptUpdate"],
                sync: {
                    interval: 5000,
                    strategy: "immediate",
                },
            },
        };
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.eventEmitter.on("itemChange", async (data) => {
            await this.validateItemStructure(data.itemPath);
            // 템플릿 변경 시 매뉴얼 업데이트
            if (data.itemPath.includes("templates") &&
                data.itemPath.endsWith(".json")) {
                const templateName = path.basename(data.itemPath, ".json");
                await this.manualGenerator.generateManual(templateName);
            }
        });
        this.eventEmitter.on("scriptUpdate", async (data) => {
            await this.validateScript(data.scriptPath);
        });
    }
    async validateItemStructure(itemPath) {
        try {
            // 디렉터리 구조 검증
            const stats = await fs.stat(itemPath);
            if (stats.isDirectory()) {
                for (const dir of this.principles.directory.structure) {
                    const dirPath = path.join(itemPath, dir);
                    try {
                        const dirStats = await fs.stat(dirPath);
                        if (!dirStats.isDirectory()) {
                            console.warn(`Warning: ${dirPath} exists but is not a directory`);
                        }
                    }
                    catch (err) {
                        await fs.mkdir(dirPath, { recursive: true });
                    }
                }
            }
            // 네이밍 규칙 검증
            const pattern = new RegExp(this.principles.naming.pattern);
            const files = await fs.readdir(itemPath);
            for (const file of files) {
                const filePath = path.join(itemPath, file);
                const fileStats = await fs.stat(filePath);
                if (fileStats.isFile()) {
                    // 파일만 검사
                    if (!pattern.test(file)) {
                        console.warn(`Warning: ${file} does not follow naming convention`);
                    }
                }
            }
            return true;
        }
        catch (error) {
            console.error("Error validating item structure:", error);
            return false;
        }
    }
    async validateScript(scriptPath) {
        try {
            const stats = await fs.stat(scriptPath);
            if (stats.isDirectory()) {
                const files = await fs.readdir(scriptPath);
                let allValid = true;
                for (const file of files) {
                    if (file.endsWith(".ts")) {
                        const filePath = path.join(scriptPath, file);
                        const content = await fs.readFile(filePath, "utf-8");
                        const filename = path.basename(filePath);
                        // 파일명 검증
                        if (!new RegExp(this.principles.naming.pattern).test(filename)) {
                            console.warn(`Warning: Script ${filename} does not follow naming convention`);
                            allValid = false;
                        }
                        // 기본 구조 검증
                        const requiredPatterns = [
                            /export\s+class/,
                            /constructor/,
                            /async\s+execute/,
                        ];
                        for (const pattern of requiredPatterns) {
                            if (!pattern.test(content)) {
                                console.warn(`Warning: Script ${filename} missing required pattern: ${pattern}`);
                                allValid = false;
                            }
                        }
                    }
                }
                return allValid;
            }
            else {
                const content = await fs.readFile(scriptPath, "utf-8");
                const filename = path.basename(scriptPath);
                // 파일명 검증
                if (!new RegExp(this.principles.naming.pattern).test(filename)) {
                    console.warn(`Warning: Script ${filename} does not follow naming convention`);
                    return false;
                }
                // 기본 구조 검증
                const requiredPatterns = [
                    /export\s+class/,
                    /constructor/,
                    /async\s+execute/,
                ];
                for (const pattern of requiredPatterns) {
                    if (!pattern.test(content)) {
                        console.warn(`Warning: Script ${filename} missing required pattern: ${pattern}`);
                        return false;
                    }
                }
                return true;
            }
        }
        catch (error) {
            console.error("Error validating script:", error);
            return false;
        }
    }
    async monitorChanges() {
        const watcher = require("chokidar").watch(this.rootDir, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
        });
        watcher
            .on("add", (path) => {
            this.eventEmitter.emit("itemChange", { itemPath: path, type: "add" });
        })
            .on("change", (path) => {
            this.eventEmitter.emit("itemChange", {
                itemPath: path,
                type: "change",
            });
        });
    }
    getPrinciples() {
        return this.principles;
    }
    async generateAllManuals() {
        try {
            const templates = await fs.readdir(path.join(this.rootDir, "templates"));
            for (const template of templates) {
                if (template.endsWith(".json")) {
                    const templateName = path.basename(template, ".json");
                    await this.manualGenerator.generateManual(templateName);
                }
            }
            console.log("모든 매뉴얼 생성 완료");
        }
        catch (error) {
            console.error("매뉴얼 생성 오류:", error);
            throw error;
        }
    }
}
exports.AutomationControl = AutomationControl;
//# sourceMappingURL=automation-control.js.map