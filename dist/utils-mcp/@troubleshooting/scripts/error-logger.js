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
exports.ErrorLogger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ErrorLogger {
    constructor(logPath) {
        this.logPath = logPath;
        this.errorCache = new Map();
        this.initializeLogger();
    }
    initializeLogger() {
        if (!fs.existsSync(this.logPath)) {
            fs.mkdirSync(this.logPath, { recursive: true });
        }
    }
    async logError(error, errorCase) {
        const timestamp = new Date().toISOString();
        const errorDoc = {
            id: errorCase?.id || `ERROR_${Date.now()}`,
            category: errorCase?.category || "OTHER",
            message: error.message,
            timestamp,
            fixed: false,
            isFigmaSpecific: errorCase?.isFigmaSpecific || false,
            occurrences: 1,
            lastOccurrence: timestamp,
        };
        // 에러 캐시 업데이트
        const existingError = this.errorCache.get(errorDoc.id);
        if (existingError) {
            errorDoc.occurrences = existingError.occurrences + 1;
            errorDoc.fixed = existingError.fixed;
        }
        this.errorCache.set(errorDoc.id, errorDoc);
        // 에러 로그 파일 업데이트
        await this.updateErrorLog(errorDoc);
        // 콘솔 출력
        console.error(`🔴 에러 발생: ${errorDoc.id}`);
        console.error(`- 메시지: ${errorDoc.message}`);
        console.error(`- 카테고리: ${errorDoc.category}`);
        console.error(`- 발생 횟수: ${errorDoc.occurrences}`);
    }
    async updateErrorLog(errorDoc) {
        const logFile = path.join(this.logPath, `${errorDoc.category.toLowerCase()}.log`);
        const logEntry = `[${errorDoc.timestamp}] ${errorDoc.id}: ${errorDoc.message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }
    getErrorStats() {
        return {
            totalErrors: this.errorCache.size,
            fixedErrors: Array.from(this.errorCache.values()).filter((e) => e.fixed)
                .length,
            pendingErrors: Array.from(this.errorCache.values()).filter((e) => !e.fixed).length,
            figmaErrors: Array.from(this.errorCache.values()).filter((e) => e.isFigmaSpecific).length,
        };
    }
}
exports.ErrorLogger = ErrorLogger;
//# sourceMappingURL=error-logger.js.map