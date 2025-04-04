import { EventEmitter } from "events";
import * as fs from "fs/promises";
import * as path from "path";

interface CommunicationEvent {
  type: string;
  source: string;
  target?: string;
  data: any;
  timestamp: number;
}

interface SyncConfig {
  interval: number;
  strategy: "immediate" | "batch";
  batchSize?: number;
}

export class CommunicationControl {
  private eventEmitter: EventEmitter;
  private eventLog: CommunicationEvent[];
  private syncConfig: SyncConfig;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventLog = [];
    this.syncConfig = {
      interval: 5000,
      strategy: "immediate",
    };
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // 아이템 변경 이벤트
    this.eventEmitter.on("itemChange", (event: CommunicationEvent) => {
      this.logEvent(event);
      this.handleItemChange(event);
    });

    // 매뉴얼 업데이트 이벤트
    this.eventEmitter.on("manualUpdate", (event: CommunicationEvent) => {
      this.logEvent(event);
      this.handleManualUpdate(event);
    });

    // 스크립트 업데이트 이벤트
    this.eventEmitter.on("scriptUpdate", (event: CommunicationEvent) => {
      this.logEvent(event);
      this.handleScriptUpdate(event);
    });
  }

  private logEvent(event: CommunicationEvent): void {
    this.eventLog.push({
      ...event,
      timestamp: Date.now(),
    });

    // 이벤트 로그 크기 제한
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000);
    }
  }

  private async handleItemChange(event: CommunicationEvent): Promise<void> {
    try {
      // 변경된 아이템의 의존성 확인
      const dependencies = await this.checkDependencies(event.source);

      // 의존성이 있는 아이템들에 대한 업데이트 알림
      for (const dep of dependencies) {
        this.notifyDependentItem(dep, event);
      }

      // 상태 동기화
      if (this.syncConfig.strategy === "immediate") {
        await this.synchronizeState(event.source);
      }
    } catch (error) {
      console.error("Error handling item change:", error);
    }
  }

  private async handleManualUpdate(event: CommunicationEvent): Promise<void> {
    try {
      const manualPath = event.data.manualPath;

      // 매뉴얼 유효성 검사
      await this.validateManual(manualPath);

      // 연관된 매뉴얼 업데이트
      await this.updateRelatedManuals(manualPath);
    } catch (error) {
      console.error("Error handling manual update:", error);
    }
  }

  private async handleScriptUpdate(event: CommunicationEvent): Promise<void> {
    try {
      const scriptPath = event.data.scriptPath;

      // 스크립트 유효성 검사
      await this.validateScript(scriptPath);

      // 관련 매뉴얼 업데이트
      await this.updateScriptManual(scriptPath);
    } catch (error) {
      console.error("Error handling script update:", error);
    }
  }

  private async checkDependencies(itemPath: string): Promise<string[]> {
    // TODO: 의존성 체크 로직 구현
    return [];
  }

  private notifyDependentItem(
    itemPath: string,
    event: CommunicationEvent
  ): void {
    this.eventEmitter.emit("dependencyUpdate", {
      type: "dependencyUpdate",
      source: event.source,
      target: itemPath,
      data: event.data,
      timestamp: Date.now(),
    });
  }

  private async synchronizeState(itemPath: string): Promise<void> {
    // TODO: 상태 동기화 로직 구현
  }

  private async validateManual(manualPath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(manualPath, "utf-8");

      // 기본 구조 검증
      const requiredSections = ["## 설명", "## 기능", "## 사용법"];
      for (const section of requiredSections) {
        if (!content.includes(section)) {
          console.warn(
            `Warning: Manual ${manualPath} missing required section: ${section}`
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error validating manual:", error);
      return false;
    }
  }

  private async validateScript(scriptPath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(scriptPath, "utf-8");

      // 기본 구조 검증
      const requiredPatterns = [
        /export\s+class/,
        /constructor/,
        /async\s+execute/,
      ];

      for (const pattern of requiredPatterns) {
        if (!pattern.test(content)) {
          console.warn(
            `Warning: Script ${scriptPath} missing required pattern: ${pattern}`
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error validating script:", error);
      return false;
    }
  }

  private async updateRelatedManuals(manualPath: string): Promise<void> {
    // TODO: 연관 매뉴얼 업데이트 로직 구현
  }

  private async updateScriptManual(scriptPath: string): Promise<void> {
    // TODO: 스크립트 매뉴얼 업데이트 로직 구현
  }

  public getEventLog(): CommunicationEvent[] {
    return this.eventLog;
  }

  public setSyncConfig(config: SyncConfig): void {
    this.syncConfig = {
      ...this.syncConfig,
      ...config,
    };
  }

  public async monitorChanges(rootDir: string): Promise<void> {
    const watcher = require("chokidar").watch(rootDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
    });

    watcher
      .on("add", (path: string) => {
        this.eventEmitter.emit("itemChange", {
          type: "itemChange",
          source: path,
          data: { type: "add" },
          timestamp: Date.now(),
        });
      })
      .on("change", (path: string) => {
        this.eventEmitter.emit("itemChange", {
          type: "itemChange",
          source: path,
          data: { type: "change" },
          timestamp: Date.now(),
        });
      });
  }
}
