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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const manual_generator_1 = require("../manual-generator");
describe('ManualGenerator', () => {
    let generator;
    let templatesDir;
    let outputDir;
    let backupsDir;
    beforeEach(() => {
        templatesDir = path.join(process.cwd(), 'templates');
        outputDir = path.join(process.cwd(), 'output');
        backupsDir = path.join(templatesDir, 'backups');
        [templatesDir, outputDir, backupsDir].forEach((dir) => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
        fs.writeFileSync(path.join(templatesDir, 'main.txt'), '{{system.name}} v{{system.version}}');
        fs.writeFileSync(path.join(templatesDir, 'control.txt'), '{{system.name}} v{{system.version}}');
        generator = new manual_generator_1.ManualGenerator();
    });
    afterEach(() => {
        [templatesDir, outputDir, backupsDir].forEach((dir) => {
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true, force: true });
            }
        });
    });
    describe('generateManuals', () => {
        it('매뉴얼을 성공적으로 생성해야 합니다', async () => {
            const context = {
                system: {
                    name: 'TestSystem',
                    version: '1.0.0',
                },
            };
            const { mainOutput, controlOutput } = await generator.generateManuals(context);
            expect(fs.existsSync(mainOutput)).toBe(true);
            expect(fs.existsSync(controlOutput)).toBe(true);
            const mainContent = fs.readFileSync(mainOutput, 'utf-8');
            const controlContent = fs.readFileSync(controlOutput, 'utf-8');
            expect(mainContent).toBe('TestSystem v1.0.0');
            expect(controlContent).toBe('TestSystem v1.0.0');
        });
        it('이미 처리 중인 경우 에러를 발생시켜야 합니다', async () => {
            const context = {
                system: {
                    name: 'TestSystem',
                    version: '1.0.0',
                },
            };
            const firstPromise = generator.generateManuals(context);
            await expect(generator.generateManuals(context)).rejects.toThrow('매뉴얼 생성이 이미 진행 중입니다');
            await firstPromise;
        });
        it('템플릿 파일이 없을 때 에러를 발생시켜야 합니다', async () => {
            fs.unlinkSync(path.join(templatesDir, 'main.txt'));
            fs.unlinkSync(path.join(templatesDir, 'control.txt'));
            const context = {
                system: {
                    name: 'TestSystem',
                    version: '1.0.0',
                },
            };
            await expect(generator.generateManuals(context)).rejects.toThrow('템플릿 파일이 존재하지 않습니다');
        });
        it('출력 디렉토리가 없을 때 생성해야 합니다', async () => {
            fs.rmdirSync(outputDir);
            const context = {
                system: {
                    name: 'TestSystem',
                    version: '1.0.0',
                },
            };
            const { mainOutput, controlOutput } = await generator.generateManuals(context);
            expect(fs.existsSync(outputDir)).toBe(true);
            expect(fs.existsSync(mainOutput)).toBe(true);
            expect(fs.existsSync(controlOutput)).toBe(true);
        });
    });
    describe('로그 관리', () => {
        it('로그를 올바르게 기록해야 합니다', async () => {
            const context = {
                system: {
                    name: '테스트 시스템',
                    version: '1.0.0',
                },
                systemName: '테스트 시스템',
                systemType: '테스트',
                projectPath: '/test/path',
                version: '1.0.0',
                author: '테스트 작성자',
                lastModified: new Date().toISOString(),
            };
            await generator.generateManuals(context);
            const logs = generator.getLogs();
            expect(logs.length).toBeGreaterThan(0);
            expect(logs[0].message).toContain('매뉴얼 생성 시작');
        });
        it('로그를 정리할 수 있어야 합니다', async () => {
            const context = {
                system: {
                    name: '테스트 시스템',
                    version: '1.0.0',
                },
                systemName: '테스트 시스템',
                systemType: '테스트',
                projectPath: '/test/path',
                version: '1.0.0',
                author: '테스트 작성자',
                lastModified: new Date().toISOString(),
            };
            await generator.generateManuals(context);
            expect(generator.getLogs().length).toBeGreaterThan(0);
            generator.clearLogs();
            expect(generator.getLogs().length).toBe(0);
        });
    });
});
//# sourceMappingURL=manual-generator.test.js.map