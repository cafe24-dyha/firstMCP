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
const template_manager_1 = require("../template-manager");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
describe("TemplateManager", () => {
    let templateManager;
    const testTemplatesDir = path.join(__dirname, "test-templates");
    const testContext = {
        systemName: "테스트 시스템",
        systemType: "테스트",
        projectPath: "/test/project",
        version: "1.0.0",
        author: "테스터",
        lastModified: new Date().toISOString(),
        purpose: "테스트 목적",
        features: ["기능1", "기능2"],
        implementation: "구현 내용",
        directoryStructure: "디렉토리 구조",
        execution: "실행 방법",
        glossary: { 용어1: "설명1" },
        changes: ["변경사항1"],
        status: "정상",
    };
    beforeAll(() => {
        if (!fs.existsSync(testTemplatesDir)) {
            fs.mkdirSync(testTemplatesDir, { recursive: true });
        }
        const mainTemplate = `# {{systemName}}\n\n## 목적\n{{purpose}}\n\n## 기능\n{{features}}\n\n## 구현\n{{implementation}}\n\n## 디렉토리\n{{directoryStructure}}\n\n## 실행\n{{execution}}\n\n## 용어\n{{glossary}}\n\n## 변경사항\n{{changes}}\n\n## 상태\n{{status}}\n\n---\n\n마지막 수정: {{lastModified}}`;
        const controlTemplate = `# {{systemName}} 컨트롤\n\n## 흐름\n{{flow}}\n\n## 구성요소\n{{components}}\n\n## 로그\n{{logs}}\n\n## 디버깅\n{{debugging}}\n\n## 문제해결\n{{troubleshooting}}\n\n## 이벤트\n{{events}}\n\n## 오류처리\n{{errorHandling}}\n\n## 동기화\n{{sync}}\n\n## 상태\n{{status}}\n\n## 최적화\n{{optimization}}\n\n## 분석\n{{analysis}}\n\n## 최근\n{{recent}}\n\n## 디버그\n{{debug}}\n\n---\n\n마지막 수정: {{lastModified}}`;
        fs.writeFileSync(path.join(testTemplatesDir, "templates/main.md"), mainTemplate);
        fs.writeFileSync(path.join(testTemplatesDir, "templates/control.md"), controlTemplate);
    });
    beforeEach(() => {
        templateManager = new template_manager_1.TemplateManager(testTemplatesDir);
    });
    afterAll(() => {
        if (fs.existsSync(testTemplatesDir)) {
            fs.rmSync(testTemplatesDir, { recursive: true, force: true });
        }
    });
    describe("loadTemplates", () => {
        it("템플릿 파일을 성공적으로 로드해야 함", async () => {
            const templates = await templateManager.loadTemplates();
            expect(templates.main).toBeDefined();
            expect(templates.control).toBeDefined();
        });
        it("템플릿 파일이 없을 경우 에러를 발생시켜야 함", async () => {
            const invalidManager = new template_manager_1.TemplateManager("/invalid/path");
            await expect(invalidManager.loadTemplates()).rejects.toThrow();
        });
    });
    describe("validateTemplate", () => {
        it("유효한 템플릿을 검증해야 함", async () => {
            const result = await templateManager.validateTemplate("main.md");
            expect(result).toBe(true);
        });
        it("잘못된 템플릿 이름에 대해 에러를 발생시켜야 함", async () => {
            await expect(templateManager.validateTemplate("invalid.md")).rejects.toThrow();
        });
    });
    describe("backupTemplate", () => {
        it("템플릿을 성공적으로 백업해야 함", async () => {
            await templateManager.backupTemplate("main.md");
            const backupsDir = path.join(testTemplatesDir, "templates/backups");
            const backups = fs.readdirSync(backupsDir);
            expect(backups.length).toBeGreaterThan(0);
            expect(backups[0]).toMatch(/main\.md\.\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });
        it("최대 백업 수를 초과하지 않아야 함", async () => {
            for (let i = 0; i < 15; i++) {
                await templateManager.backupTemplate("main.md");
            }
            const backupsDir = path.join(testTemplatesDir, "templates/backups");
            const backups = fs.readdirSync(backupsDir);
            expect(backups.length).toBeLessThanOrEqual(10);
        });
    });
    describe("processTemplateWithContext", () => {
        it("컨텍스트를 사용하여 템플릿을 처리해야 함", async () => {
            const templates = await templateManager.loadTemplates();
            const processed = await templateManager.processTemplateWithContext(templates.main, testContext);
            expect(processed).toContain(testContext.systemName);
            expect(processed).toContain(testContext.purpose);
            expect(processed).toContain(testContext.features.join("\n"));
        });
        it("누락된 변수를 '해당 없음'으로 대체해야 함", async () => {
            const templates = await templateManager.loadTemplates();
            const incompleteContext = {
                ...testContext,
                purpose: undefined,
            };
            const processed = await templateManager.processTemplateWithContext(templates.main, incompleteContext);
            expect(processed).toContain("해당 없음");
        });
    });
    describe("lockTemplate", () => {
        it("템플릿을 성공적으로 잠금 처리해야 함", async () => {
            await templateManager.lockTemplate("main.md");
            const lockFile = path.join(testTemplatesDir, "templates/main.md.lock");
            expect(fs.existsSync(lockFile)).toBe(true);
        });
    });
    describe("unlockTemplate", () => {
        it("잠금된 템플릿을 성공적으로 잠금 해제해야 함", async () => {
            await templateManager.lockTemplate("main.md");
            await templateManager.unlockTemplate("main.md");
            const lockFile = path.join(testTemplatesDir, "templates/main.md.lock");
            expect(fs.existsSync(lockFile)).toBe(false);
        });
    });
});
//# sourceMappingURL=template-manager.test.js.map