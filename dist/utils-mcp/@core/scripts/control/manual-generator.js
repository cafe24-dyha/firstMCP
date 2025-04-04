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
exports.ManualGenerator = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class ManualGenerator {
    constructor(rootDir) {
        this.templatesDir = path.join(rootDir, "..", "templates-manuals");
        this.manualsDir = path.join(rootDir, "manuals");
    }
    async loadTemplate(templateName) {
        const templatePath = path.join(this.templatesDir, `${templateName}.json`);
        const content = await fs.readFile(templatePath, "utf-8");
        return JSON.parse(content);
    }
    async saveManual(filename, content) {
        const manualPath = path.join(this.manualsDir, filename);
        await fs.writeFile(manualPath, content, "utf-8");
    }
    generateMarkdown(template) {
        let markdown = `# ${template.title}\n\n`;
        for (const section of template.sections) {
            markdown += this.generateSection(section, 2);
        }
        markdown += `\n---\n마지막 업데이트: ${template.lastUpdate.toLocaleString()}`;
        return markdown;
    }
    generateSection(section, level) {
        let markdown = `${"#".repeat(level)} ${section.title}\n\n${section.content}\n\n`;
        if (section.subsections) {
            for (const subsection of section.subsections) {
                markdown += this.generateSection(subsection, level + 1);
            }
        }
        return markdown;
    }
    async generateManual(templateName) {
        try {
            const template = await this.loadTemplate(templateName);
            template.lastUpdate = new Date();
            const markdown = this.generateMarkdown(template);
            await this.saveManual(`${templateName}.md`, markdown);
            console.log(`매뉴얼 생성 완료: ${templateName}.md`);
        }
        catch (error) {
            console.error("매뉴얼 생성 오류:", error);
            throw error;
        }
    }
    async updateManual(templateName, updates) {
        try {
            const template = await this.loadTemplate(templateName);
            // 템플릿 업데이트
            Object.assign(template, updates);
            template.lastUpdate = new Date();
            // 새로운 매뉴얼 생성
            const markdown = this.generateMarkdown(template);
            await this.saveManual(`${templateName}.md`, markdown);
            console.log(`매뉴얼 업데이트 완료: ${templateName}.md`);
        }
        catch (error) {
            console.error("매뉴얼 업데이트 오류:", error);
            throw error;
        }
    }
}
exports.ManualGenerator = ManualGenerator;
//# sourceMappingURL=manual-generator.js.map