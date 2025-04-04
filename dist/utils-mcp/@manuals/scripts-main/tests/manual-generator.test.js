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
const manual_generator_1 = require("../manual-generator");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
describe("ManualGenerator", () => {
    let manualGenerator;
    const testTemplatesDir = path.join(__dirname, "test-templates");
    const testOutputDir = path.join(__dirname, "test-output");
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
        if (!fs.existsSync(testOutputDir)) {
            fs.mkdirSync(testOutputDir, { recursive: true });
        }
        const mainTemplate = `# {{systemName}}\n\n## 목적\n{{purpose}}\n\n## 기능\n{{features}}\n\n## 구현\n{{implementation}}\n\n## 디렉토리\n{{directoryStructure}}\n\n## 실행\n{{execution}}\n\n## 용어\n{{glossary}}\n\n## 변경사항\n{{changes}}\n\n## 상태\n{{status}}\n\n---\n\n마지막 수정: {{lastModified}}`;
        const controlTemplate = `# {{systemName}} 컨트롤\n\n## 흐름\n{{flow}}\n\n## 구성요소\n{{components}}\n\n## 로그\n{{logs}}\n\n## 디버깅\n{{debugging}}\n\n## 문제해결\n{{troubleshooting}}\n\n## 이벤트\n{{events}}\n\n## 오류처리\n{{errorHandling}}\n\n## 동기화\n{{sync}}\n\n## 상태\n{{status}}\n\n## 최적화\n{{optimization}}\n\n## 분석\n{{analysis}}\n\n## 최근\n{{recent}}\n\n## 디버그\n{{debug}}\n\n---\n\n마지막 수정: {{lastModified}}`;
        fs.writeFileSync(path.join(testTemplatesDir, "templates/main.md"), mainTemplate);
        fs.writeFileSync(path.join(testTemplatesDir, "templates/control.md"), controlTemplate);
    });
    beforeEach(() => {
        manualGenerator = new manual_generator_1.ManualGenerator(testTemplatesDir, testOutputDir);
    });
    afterAll(() => {
        if (fs.existsSync(testTemplatesDir)) {
            fs.rmSync(testTemplatesDir, { recursive: true, force: true });
        }
        if (fs.existsSync(testOutputDir)) {
            fs.rmSync(testOutputDir, { recursive: true, force: true });
        }
    });
    describe("generateManuals", () => {
        it("매뉴얼을 성공적으로 생성해야 함", async () => {
            await manualGenerator.generateManuals(testContext);
            const mainManualPath = path.join(testOutputDir, "main.md");
            const controlManualPath = path.join(testOutputDir, "control.md");
            expect(fs.existsSync(mainManualPath)).toBe(true);
            expect(fs.existsSync(controlManualPath)).toBe(true);
            const mainContent = fs.readFileSync(mainManualPath, "utf-8");
            const controlContent = fs.readFileSync(controlManualPath, "utf-8");
            expect(mainContent).toContain(testContext.systemName);
            expect(mainContent).toContain(testContext.purpose);
            expect(controlContent).toContain(testContext.systemName);
            expect(controlContent).toContain(testContext.status);
        });
        it("동시 실행을 방지해야 함", async () => {
            const generatePromise = manualGenerator.generateManuals(testContext);
            await expect(manualGenerator.generateManuals(testContext)).rejects.toThrow("이미 매뉴얼 생성이 진행 중입니다.");
            await generatePromise;
        });
        it("로그를 기록해야 함", async () => {
            await manualGenerator.generateManuals(testContext);
            const logs = manualGenerator.getLogs();
            expect(logs.length).toBeGreaterThan(0);
            expect(logs[0].level).toBe("info");
            expect(logs[0].message).toContain("매뉴얼 생성 시작");
        });
        it("오류 발생 시 로그를 기록해야 함", async () => {
            const invalidContext = { ...testContext, systemName: undefined };
            await expect(manualGenerator.generateManuals(invalidContext)).rejects.toThrow();
            const logs = manualGenerator.getLogs();
            expect(logs.some((log) => log.level === "error")).toBe(true);
        });
    });
    describe("getLogs", () => {
        it("로그 목록을 반환해야 함", async () => {
            await manualGenerator.generateManuals(testContext);
            const logs = manualGenerator.getLogs();
            expect(Array.isArray(logs)).toBe(true);
            expect(logs.length).toBeGreaterThan(0);
        });
    });
    describe("clearLogs", () => {
        it("로그를 초기화해야 함", async () => {
            await manualGenerator.generateManuals(testContext);
            manualGenerator.clearLogs();
            expect(manualGenerator.getLogs().length).toBe(0);
        });
    });
});
//# sourceMappingURL=manual-generator.test.js.map