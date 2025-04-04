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
        this.errorStats = new Map();
        this.loadStats();
    }
    loadStats() {
        const statsPath = path.join(this.logPath, "error-stats.json");
        if (fs.existsSync(statsPath)) {
            const stats = JSON.parse(fs.readFileSync(statsPath, "utf8"));
            this.errorStats = new Map(Object.entries(stats));
        }
    }
    saveStats() {
        const statsPath = path.join(this.logPath, "error-stats.json");
        const stats = Object.fromEntries(this.errorStats);
        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    }
    logError(error, errorCase) {
        const errorId = errorCase.id;
        const stats = this.errorStats.get(errorId) || {
            count: 0,
            lastOccurrence: new Date().toISOString(),
            fixed: false,
        };
        stats.count++;
        stats.lastOccurrence = new Date().toISOString();
        this.errorStats.set(errorId, stats);
        const logEntry = {
            timestamp: new Date().toISOString(),
            errorId,
            message: error.message,
            stack: error.stack,
            category: errorCase.category,
            severity: errorCase.severity,
            fixed: stats.fixed,
        };
        const logFile = path.join(this.logPath, `${errorId}.log`);
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");
        this.saveStats();
        this.updateSummary();
    }
    markErrorAsFixed(errorId) {
        const stats = this.errorStats.get(errorId);
        if (stats) {
            stats.fixed = true;
            this.errorStats.set(errorId, stats);
            this.saveStats();
            this.updateSummary();
        }
    }
    updateSummary() {
        const summary = {
            totalErrors: this.errorStats.size,
            fixedErrors: Array.from(this.errorStats.values()).filter((s) => s.fixed)
                .length,
            errorsByCategory: new Map(),
            errorsBySeverity: new Map(),
            recentErrors: [],
        };
        // 카테고리별, 심각도별 통계
        for (const [id, stats] of this.errorStats) {
            const errorCase = this.getErrorCase(id);
            if (errorCase) {
                const category = errorCase.category;
                const severity = errorCase.severity;
                summary.errorsByCategory.set(category, (summary.errorsByCategory.get(category) || 0) + 1);
                summary.errorsBySeverity.set(severity, (summary.errorsBySeverity.get(severity) || 0) + 1);
            }
            summary.recentErrors.push({
                id,
                lastOccurrence: stats.lastOccurrence,
                count: stats.count,
                fixed: stats.fixed,
            });
        }
        // 최근 발생 순으로 정렬
        summary.recentErrors.sort((a, b) => new Date(b.lastOccurrence).getTime() -
            new Date(a.lastOccurrence).getTime());
        const summaryPath = path.join(this.logPath, "summary.json");
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    }
    getErrorCase(errorId) {
        try {
            const errorCasePath = path.join(this.logPath, "..", "cases", `${errorId}.json`);
            if (fs.existsSync(errorCasePath)) {
                return JSON.parse(fs.readFileSync(errorCasePath, "utf8"));
            }
        }
        catch (error) {
            console.error(`Error loading error case ${errorId}:`, error);
        }
        return null;
    }
    getErrorStats() {
        return new Map(this.errorStats);
    }
}
exports.ErrorLogger = ErrorLogger;
//# sourceMappingURL=error-logger.js.map