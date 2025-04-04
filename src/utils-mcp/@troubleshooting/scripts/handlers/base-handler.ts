import * as fs from "fs";
import * as path from "path";
import {
  BaseErrorCase,
  ErrorContext,
  ErrorDocument,
  ErrorFix,
  ErrorStats,
} from "../types/error-base";

export abstract class BaseErrorHandler {
  protected errorCases: Map<string, BaseErrorCase>;
  protected errorFixes: Map<string, ErrorFix>;
  protected errorStats: ErrorStats;
  protected docsPath: string;

  constructor(docsPath: string) {
    this.errorCases = new Map();
    this.errorFixes = new Map();
    this.docsPath = docsPath;
    this.errorStats = {
      totalErrors: 0,
      fixedErrors: 0,
      activeErrors: new Set(),
      errorsByCategory: new Map(),
      errorsBySeverity: new Map(),
      recentErrors: [],
    };
  }

  public abstract identifyError(error: Error): BaseErrorCase | null;

  public abstract validateFix(error: Error, fix: ErrorFix): Promise<boolean>;

  protected abstract generateErrorContext(error: Error): ErrorContext;

  public async handleError(error: Error): Promise<void> {
    const errorCase = this.identifyError(error);
    if (!errorCase) {
      console.warn("미확인 에러:", error);
      return;
    }

    const context = this.generateErrorContext(error);
    const document = await this.createErrorDocument(errorCase, error, context);

    await this.logError(document);

    if (errorCase.fix) {
      const fix = this.errorFixes.get(errorCase.id);
      if (fix && (await this.validateFix(error, fix))) {
        try {
          await fix.fix();
          document.fixed = true;
          await this.updateErrorDocument(document);
        } catch (fixError) {
          console.error("에러 수정 실패:", fixError);
          if (fix.rollback) {
            await fix.rollback();
          }
        }
      }
    }

    this.updateStats(document);
  }

  protected async createErrorDocument(
    errorCase: BaseErrorCase,
    error: Error,
    context: ErrorContext
  ): Promise<ErrorDocument> {
    return {
      id: errorCase.id,
      message: error.message,
      category: errorCase.category,
      severity: errorCase.severity,
      status: "❌ 미해결",
      description: errorCase.description,
      context,
      solution: "",
      autoDetect: true,
      autoFix: !!errorCase.fix,
      occurrences: 1,
      lastOccurrence: new Date().toISOString(),
      fixed: false,
      relatedErrors: errorCase.relatedErrors || [],
      resolutionHistory: [],
    };
  }

  protected async logError(document: ErrorDocument): Promise<void> {
    const logPath = path.join(
      this.docsPath,
      "auto-generated",
      "categories",
      document.category.toLowerCase(),
      `${document.id}.md`
    );

    const content = this.formatErrorDocument(document);
    await fs.promises.writeFile(logPath, content);
  }

  protected formatErrorDocument(document: ErrorDocument): string {
    return `# ${document.id}

## 개요
${document.description}

## 문제
- **메시지**: ${document.message}
- **카테고리**: ${document.category}
- **심각도**: ${document.severity}
- **상태**: ${document.status}

## 컨텍스트
- **파일**: ${document.context.sourceFile || "알 수 없음"}
- **위치**: ${
      document.context.lineNumber
        ? `라인 ${document.context.lineNumber}`
        : "알 수 없음"
    }
${
  document.context.stackTrace
    ? `\`\`\`\n${document.context.stackTrace}\n\`\`\``
    : ""
}

## 해결 방법
${document.solution || "해결 방법이 아직 문서화되지 않았습니다."}

## 자동화 상태
- **자동 감지**: ${document.autoDetect ? "✅" : "❌"}
- **자동 수정**: ${document.autoFix ? "✅" : "❌"}

## 통계
- **발생 횟수**: ${document.occurrences}
- **마지막 발생**: ${document.lastOccurrence}
- **해결 여부**: ${document.fixed ? "✅" : "❌"}

## 관련 에러
${
  document.relatedErrors.length > 0 ? document.relatedErrors.join(", ") : "없음"
}

## 해결 이력
${
  document.resolutionHistory
    .map((h) => `- ${h.timestamp}: ${h.action} (${h.result})`)
    .join("\n") || "아직 해결 시도가 없습니다."
}

---
마지막 업데이트: ${new Date().toISOString()}`;
  }

  protected updateStats(document: ErrorDocument): void {
    this.errorStats.activeErrors.add(document.id);

    if (document.fixed) {
      this.errorStats.fixedErrors++;
    }

    this.errorStats.totalErrors = this.errorStats.activeErrors.size;

    this.errorStats.errorsByCategory.set(
      document.category,
      (this.errorStats.errorsByCategory.get(document.category) || 0) + 1
    );

    this.errorStats.errorsBySeverity.set(
      document.severity,
      (this.errorStats.errorsBySeverity.get(document.severity) || 0) + 1
    );

    this.errorStats.recentErrors.push({
      id: document.id,
      lastOccurrence: document.lastOccurrence,
      count: document.occurrences,
      fixed: document.fixed,
    });

    // 최근 발생 순으로 정렬
    this.errorStats.recentErrors.sort(
      (a, b) =>
        new Date(b.lastOccurrence).getTime() -
        new Date(a.lastOccurrence).getTime()
    );
  }

  protected async updateErrorDocument(document: ErrorDocument): Promise<void> {
    document.resolutionHistory.push({
      timestamp: new Date().toISOString(),
      action: "자동 수정 시도",
      result: document.fixed ? "성공" : "실패",
    });
    await this.logError(document);
  }

  public registerErrorCase(errorCase: BaseErrorCase): void {
    this.errorCases.set(errorCase.id, errorCase);
  }

  public registerErrorFix(fix: ErrorFix): void {
    this.errorFixes.set(fix.id, fix);
  }

  public getErrorStats(): ErrorStats {
    return { ...this.errorStats };
  }
}
