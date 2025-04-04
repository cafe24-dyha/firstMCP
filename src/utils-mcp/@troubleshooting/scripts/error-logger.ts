import * as fs from "fs";
import * as path from "path";
import { ErrorDocument, ErrorCase } from "./error-types";

export class ErrorLogger {
  private logPath: string;
  private errorCache: Map<string, ErrorDocument>;

  constructor(logPath: string) {
    this.logPath = logPath;
    this.errorCache = new Map();
    this.initializeLogger();
  }

  private initializeLogger() {
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }
  }

  public async logError(error: Error, errorCase?: ErrorCase) {
    const timestamp = new Date().toISOString();
    const errorDoc: ErrorDocument = {
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

  private async updateErrorLog(errorDoc: ErrorDocument) {
    const logFile = path.join(
      this.logPath,
      `${errorDoc.category.toLowerCase()}.log`
    );
    const logEntry = `[${errorDoc.timestamp}] ${errorDoc.id}: ${errorDoc.message}\n`;

    fs.appendFileSync(logFile, logEntry);
  }

  public getErrorStats() {
    return {
      totalErrors: this.errorCache.size,
      fixedErrors: Array.from(this.errorCache.values()).filter((e) => e.fixed)
        .length,
      pendingErrors: Array.from(this.errorCache.values()).filter(
        (e) => !e.fixed
      ).length,
      figmaErrors: Array.from(this.errorCache.values()).filter(
        (e) => e.isFigmaSpecific
      ).length,
    };
  }
}
