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
exports.AutomationController = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class AutomationController {
    constructor(rootDir) {
        this.rootDir = rootDir;
        this.eventEmitter = new events_1.EventEmitter();
        this.items = new Map();
        this.metrics = {
            itemCount: 0,
            activeItems: 0,
            errorCount: 0,
            lastCheck: new Date(),
        };
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        // 아이템 변경 감지
        this.eventEmitter.on("itemChange", async (itemPath) => {
            await this.validateItemStructure(itemPath);
            await this.updateItemStatus(itemPath);
        });
        // 템플릿 변경 감지
        this.eventEmitter.on("templateChange", async (templatePath) => {
            if (templatePath.startsWith("templates-manuals")) {
                await this.generateManual(templatePath);
            }
        });
        // 최적화 모니터링
        this.eventEmitter.on("optimizationCheck", async () => {
            await this.checkOptimization();
        });
    }
    async validateItemStructure(itemPath) {
        try {
            const requiredDirs = ["scripts", "manuals"];
            for (const dir of requiredDirs) {
                const dirPath = path.join(itemPath, dir);
                await fs.mkdir(dirPath, { recursive: true });
            }
            return true;
        }
        catch (error) {
            console.error("디렉토리 구조 검증 오류:", error);
            return false;
        }
    }
    async updateItemStatus(itemPath) {
        const name = path.basename(itemPath);
        const type = this.getItemType(itemPath);
        const item = {
            name,
            type,
            status: "active",
            lastUpdate: new Date(),
        };
        this.items.set(name, item);
        await this.updateMetrics();
    }
    getItemType(itemPath) {
        if (itemPath.includes("core"))
            return "core";
        if (itemPath.includes("templates"))
            return "templates";
        return "automation";
    }
    async updateMetrics() {
        this.metrics = {
            itemCount: this.items.size,
            activeItems: Array.from(this.items.values()).filter((item) => item.status === "active").length,
            errorCount: Array.from(this.items.values()).filter((item) => item.status === "error").length,
            lastCheck: new Date(),
        };
    }
    async checkOptimization() {
        const isOptimized = this.metrics.errorCount === 0 &&
            this.metrics.activeItems === this.metrics.itemCount;
        if (!isOptimized) {
            console.log("최적화 필요:", {
                totalItems: this.metrics.itemCount,
                activeItems: this.metrics.activeItems,
                errors: this.metrics.errorCount,
            });
        }
        return isOptimized;
    }
    async createNewItem(itemName) {
        const itemPath = path.join(this.rootDir, itemName);
        try {
            // 디렉토리 생성
            await this.validateItemStructure(itemPath);
            // 기본 파일 생성
            await fs.writeFile(path.join(itemPath, "scripts", "index.ts"), `export * from './control';\nexport * from './main';\n`);
            // 상태 업데이트
            await this.updateItemStatus(itemPath);
            console.log(`새 아이템 생성 완료: ${itemName}`);
        }
        catch (error) {
            console.error("아이템 생성 오류:", error);
            throw error;
        }
    }
    async startMonitoring() {
        const checkInterval = 5000; // 5초
        const monitor = async () => {
            const isOptimized = await this.checkOptimization();
            if (!isOptimized) {
                // 최적화가 필요한 경우 이벤트 발생
                this.eventEmitter.emit("optimizationCheck");
                // 재귀적으로 모니터링 계속
                setTimeout(monitor, checkInterval);
            }
            else {
                console.log("모든 아이템이 최적화되었습니다.");
            }
        };
        // 모니터링 시작
        monitor();
    }
    async generateManual(templatePath) {
        try {
            const content = await fs.readFile(templatePath, "utf-8");
            const template = JSON.parse(content);
            const manualPath = templatePath
                .replace("templates-manuals/scripts", "templates-manuals/manuals")
                .replace(".json", ".md");
            // 마크다운 생성
            const markdown = this.generateMarkdown(template);
            await fs.writeFile(manualPath, markdown, "utf-8");
            console.log(`매뉴얼 생성 완료: ${path.basename(manualPath)}`);
        }
        catch (error) {
            console.error("매뉴얼 생성 오류:", error);
            throw error;
        }
    }
    generateMarkdown(template) {
        let markdown = `# ${template.title}\n\n`;
        if (template.sections) {
            for (const section of template.sections) {
                markdown += `## ${section.title}\n\n${section.content}\n\n`;
                if (section.subsections) {
                    for (const subsection of section.subsections) {
                        markdown += `### ${subsection.title}\n\n${subsection.content}\n\n`;
                    }
                }
            }
        }
        markdown += `\n---\n마지막 업데이트: ${new Date().toLocaleString()}`;
        return markdown;
    }
    getMetrics() {
        return { ...this.metrics };
    }
}
exports.AutomationController = AutomationController;
//# sourceMappingURL=automation-controller.js.map