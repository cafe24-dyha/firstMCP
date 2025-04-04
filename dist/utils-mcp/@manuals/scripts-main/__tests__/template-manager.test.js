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
const template_manager_1 = require("../template-manager");
describe('TemplateManager', () => {
    let manager;
    const templatesDir = path.join(process.cwd(), 'templates', 'src');
    const backupsDir = path.join(process.cwd(), 'templates', 'backups');
    beforeEach(() => {
        [templatesDir, backupsDir].forEach((dir) => {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                files.forEach((file) => {
                    fs.unlinkSync(path.join(dir, file));
                });
                fs.rmdirSync(dir);
            }
            fs.mkdirSync(dir, { recursive: true });
        });
        manager = new template_manager_1.TemplateManager();
        fs.writeFileSync(path.join(templatesDir, 'main.txt'), '{{system.name}} v{{system.version}}');
        fs.writeFileSync(path.join(templatesDir, 'control.txt'), '{{system.name}} v{{system.version}}');
    });
    afterEach(() => {
        [templatesDir, backupsDir].forEach((dir) => {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                files.forEach((file) => {
                    fs.unlinkSync(path.join(dir, file));
                });
                fs.rmdirSync(dir);
            }
        });
    });
    describe('loadTemplates', () => {
        it('템플릿을 성공적으로 로드해야 합니다', async () => {
            const mainTemplate = await manager.loadTemplates('main');
            const controlTemplate = await manager.loadTemplates('control');
            expect(mainTemplate).toContain('{{system.name}}');
            expect(mainTemplate).toContain('{{system.version}}');
            expect(controlTemplate).toContain('{{system.name}}');
            expect(controlTemplate).toContain('{{system.version}}');
        });
        it('템플릿 파일이 없을 때 에러를 발생시켜야 합니다', async () => {
            fs.unlinkSync(path.join(templatesDir, 'main.txt'));
            await expect(manager.loadTemplates('main')).rejects.toThrow('템플릿 파일이 존재하지 않습니다');
        });
        it('템플릿 파일이 비어있을 때 에러를 발생시켜야 합니다', async () => {
            fs.writeFileSync(path.join(templatesDir, 'main.txt'), '');
            await expect(manager.loadTemplates('main')).rejects.toThrow('템플릿 파일이 비어있습니다');
        });
    });
    describe('processTemplateWithContext', () => {
        it('템플릿 변수를 올바르게 치환해야 합니다', async () => {
            const context = {
                system: {
                    name: 'TestSystem',
                    version: '1.0.0',
                },
            };
            const mainTemplate = await manager.loadTemplates('main');
            const processedMain = manager.processTemplateWithContext(mainTemplate, context);
            expect(processedMain).toBe('TestSystem v1.0.0');
        });
        it('중첩된 변수를 올바르게 치환해야 합니다', () => {
            const template = '{{user.name}}의 나이는 {{user.age}}살입니다.';
            const context = {
                user: {
                    name: '홍길동',
                    age: 30,
                },
            };
            const processed = manager.processTemplateWithContext(template, context);
            expect(processed).toBe('홍길동의 나이는 30살입니다.');
        });
        it('존재하지 않는 변수는 무시해야 합니다', () => {
            const template = '{{name}} {{unknown}}';
            const context = { name: 'Test' };
            const processed = manager.processTemplateWithContext(template, context);
            expect(processed).toBe('Test {{unknown}}');
        });
    });
    describe('backupTemplate', () => {
        it('템플릿을 성공적으로 백업해야 합니다', async () => {
            await manager.backupTemplate('main');
            const backupFiles = fs.readdirSync(backupsDir);
            expect(backupFiles.length).toBe(1);
            expect(backupFiles[0]).toMatch(/^main_.*\.txt$/);
        });
        it('최대 백업 수를 초과하지 않아야 합니다', async () => {
            for (let i = 0; i < 10; i++) {
                await manager.backupTemplate('main');
            }
            const backupFiles = fs.readdirSync(backupsDir);
            expect(backupFiles.length).toBeLessThanOrEqual(5);
        });
        it('백업 디렉토리가 없을 때 생성해야 합니다', async () => {
            fs.rmdirSync(backupsDir);
            await manager.backupTemplate('main');
            expect(fs.existsSync(backupsDir)).toBe(true);
        });
    });
    describe('lockTemplate', () => {
        it('템플릿을 성공적으로 잠금해야 합니다', async () => {
            await manager.lockTemplate('main');
            expect(fs.existsSync(path.join(templatesDir, 'main.txt.lock'))).toBe(true);
        });
        it('이미 잠긴 템플릿을 잠그려고 할 때 에러를 발생시켜야 합니다', async () => {
            await manager.lockTemplate('main');
            await expect(manager.lockTemplate('main')).rejects.toThrow('템플릿이 이미 잠겨있습니다');
        });
    });
    describe('unlockTemplate', () => {
        it('템플릿 잠금을 성공적으로 해제해야 합니다', async () => {
            await manager.lockTemplate('main');
            await manager.unlockTemplate('main');
            expect(fs.existsSync(path.join(templatesDir, 'main.txt.lock'))).toBe(false);
        });
        it('잠금 파일이 없을 때도 에러 없이 처리해야 합니다', async () => {
            await expect(manager.unlockTemplate('main')).resolves.not.toThrow();
        });
    });
});
//# sourceMappingURL=template-manager.test.js.map