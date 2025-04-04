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
exports.UpdateGuide = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class UpdateGuide {
    constructor(config) {
        this.config = config;
        this.guidePath = path.join(config.targetDir, "DOC", "instruction.md");
    }
    async update() {
        try {
            await this.checkGuideFile();
            await this.updateGuideContent();
            await this.createBackup();
            this.logger.info("가이드 업데이트 완료");
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`가이드 업데이트 실패: ${error.message}`);
            }
            throw new Error("가이드 업데이트 실패: 알 수 없는 오류");
        }
    }
    async checkGuideFile() {
        try {
            await fs.promises.access(this.guidePath);
        }
        catch (_a) {
            throw new Error("가이드 파일을 찾을 수 없습니다.");
        }
    }
    async updateGuideContent() {
        const content = await fs.promises.readFile(this.guidePath, "utf-8");
        const updatedContent = this.processGuideContent(content);
        await fs.promises.writeFile(this.guidePath, updatedContent, "utf-8");
    }
    processGuideContent(content) {
        let processedContent = content;
        processedContent = processedContent.replace(/{시스템명}/g, this.config.systemName);
        processedContent = processedContent.replace(/{요청폴더}/g, this.config.targetDir);
        const directoryStructure = this.generateDirectoryStructure();
        processedContent = processedContent.replace(/{디렉토리구조}/g, directoryStructure);
        processedContent = processedContent.replace(/{changes}/g, this.config.changes);
        return processedContent;
    }
    generateDirectoryStructure() {
        return `
@manuals/
├── scripts-main/         # 스크립트
│   ├── templates/        # 템플릿
│   │   ├── lib/         # 공통 라이브러리
│   │   ├── backups/     # 템플릿 백업
│   │   ├── main.md      # 메인 템플릿
│   │   └── control.md   # 제어 템플릿
│   ├── scripts/         # 유틸리티 스크립트
│   ├── backup/          # 백업 파일
│   └── logs/            # 로그 파일
├── manuals/             # 생성된 매뉴얼
│   ├── backups/        # 매뉴얼 백업
│   ├── main.md         # 메인 매뉴얼
│   └── control.md      # 제어 매뉴얼
└── logs/               # 시스템 로그
`;
    }
    async createBackup() {
        const backupDir = path.join(this.config.backupDir, "guides");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupPath = path.join(backupDir, `instruction-${timestamp}.md`);
        try {
            await fs.promises.mkdir(backupDir, { recursive: true });
            await fs.promises.copyFile(this.guidePath, backupPath);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`백업 생성 실패: ${error.message}`);
            }
            throw new Error("백업 생성 실패: 알 수 없는 오류");
        }
    }
    getUpdateStatus() {
        return {
            lastUpdate: new Date().toISOString(),
            status: "완료",
            backupCount: 1,
        };
    }
}
exports.UpdateGuide = UpdateGuide;
//# sourceMappingURL=update-guide.js.map