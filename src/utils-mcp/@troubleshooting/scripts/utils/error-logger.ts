import * as fs from "fs";
import * as path from "path";
import { ErrorCase } from "../types/error-types";

export class ErrorLogger {
  private logPath: string;
  private errorStats: Map<
    string,
    {
      count: number;
      lastOccurrence: string;
      fixed: boolean;
    }
  >;

  constructor(logPath: string) {
    this.logPath = logPath;
    this.errorStats = new Map();
    this.loadStats();
  }

  private loadStats() {
    const statsPath = path.join(this.logPath, "error-stats.json");
    if (fs.existsSync(statsPath)) {
      const stats = JSON.parse(fs.readFileSync(statsPath, "utf8"));
      this.errorStats = new Map(Object.entries(stats));
    }
  }

  private saveStats() {
    const statsPath = path.join(this.logPath, "error-stats.json");
    const stats = Object.fromEntries(this.errorStats);
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  }

  public logError(error: Error, errorCase: ErrorCase): void {
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

  public markErrorAsFixed(errorId: string): void {
    const stats = this.errorStats.get(errorId);
    if (stats) {
      stats.fixed = true;
      this.errorStats.set(errorId, stats);
      this.saveStats();
      this.updateSummary();
    }
  }

  private updateSummary(): void {
    const summary = {
      totalErrors: this.errorStats.size,
      fixedErrors: Array.from(this.errorStats.values()).filter((s) => s.fixed)
        .length,
      errorsByCategory: new Map<string, number>(),
      errorsBySeverity: new Map<string, number>(),
      recentErrors: [] as Array<{
        id: string;
        lastOccurrence: string;
        count: number;
        fixed: boolean;
      }>,
    };

    // 카테고리별, 심각도별 통계
    for (const [id, stats] of this.errorStats) {
      const errorCase = this.getErrorCase(id);
      if (errorCase) {
        const category = errorCase.category;
        const severity = errorCase.severity;

        summary.errorsByCategory.set(
          category,
          (summary.errorsByCategory.get(category) || 0) + 1
        );

        summary.errorsBySeverity.set(
          severity,
          (summary.errorsBySeverity.get(severity) || 0) + 1
        );
      }

      summary.recentErrors.push({
        id,
        lastOccurrence: stats.lastOccurrence,
        count: stats.count,
        fixed: stats.fixed,
      });
    }

    // 최근 발생 순으로 정렬
    summary.recentErrors.sort(
      (a, b) =>
        new Date(b.lastOccurrence).getTime() -
        new Date(a.lastOccurrence).getTime()
    );

    const summaryPath = path.join(this.logPath, "summary.json");
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  }

  private getErrorCase(errorId: string): ErrorCase | null {
    try {
      const errorCasePath = path.join(
        this.logPath,
        "..",
        "cases",
        `${errorId}.json`
      );
      if (fs.existsSync(errorCasePath)) {
        return JSON.parse(fs.readFileSync(errorCasePath, "utf8"));
      }
    } catch (error) {
      console.error(`Error loading error case ${errorId}:`, error);
    }
    return null;
  }

  public getErrorStats(): Map<
    string,
    {
      count: number;
      lastOccurrence: string;
      fixed: boolean;
    }
  > {
    return new Map(this.errorStats);
  }
}
