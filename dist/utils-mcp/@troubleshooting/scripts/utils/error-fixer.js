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
exports.ErrorFixer = void 0;
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
class ErrorFixer {
    constructor() {
        this.fixers = new Map();
        this.initializeFixers();
    }
    initializeFixers() {
        // BE001: esbuild destructuring transform error
        this.fixers.set("BE001", async (filePath, match) => {
            console.log("🔧 Fixing destructuring error in:", filePath);
            const content = fs.readFileSync(filePath, "utf8");
            const fixed = content.replace(/for\s*\(const\s*\[([^,\]]+),\s*([^\]]+)\]\s*of\s*Object\.entries\(([^)]+)\)\)/g, "Object.entries($3).forEach(([$1, $2]) =>");
            fs.writeFileSync(filePath, fixed);
        });
        // PE001: Plugin initialization error
        this.fixers.set("PE001", async (filePath) => {
            console.log("🔧 Fixing plugin initialization...");
            await this.runCommand("npm run build");
        });
        // AE001: API authentication error
        this.fixers.set("AE001", async () => {
            console.log("🔧 Refreshing API token...");
            await this.refreshApiToken();
        });
        // UE001: UI rendering error
        this.fixers.set("UE001", async (filePath) => {
            console.log("🔧 Fixing UI component in:", filePath);
            await this.runCommand("npm run build");
        });
    }
    async fixError(errorCase, filePath, match) {
        try {
            const fixer = this.fixers.get(errorCase.id);
            if (!fixer) {
                console.log(`❌ ${errorCase.id}에 대한 자동 수정 기능이 없습니다.`);
                return false;
            }
            await fixer(filePath, match);
            console.log(`✅ ${errorCase.id} 에러가 자동으로 수정되었습니다.`);
            return true;
        }
        catch (error) {
            console.error(`❌ ${errorCase.id} 에러 수정 중 실패:`, error);
            return false;
        }
    }
    async runCommand(command) {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout);
            });
        });
    }
    async refreshApiToken() {
        // API 토큰 갱신 로직 구현
        console.log("API 토큰 갱신 중...");
    }
    registerFixer(errorId, fixer) {
        this.fixers.set(errorId, fixer);
        console.log(`✅ ${errorId}에 대한 자동 수정 기능이 등록되었습니다.`);
    }
}
exports.ErrorFixer = ErrorFixer;
//# sourceMappingURL=error-fixer.js.map