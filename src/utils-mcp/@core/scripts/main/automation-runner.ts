import { AutomationControl } from "../control/automation-control";
import { CommunicationControl } from "../control/communication-control";
import * as path from "path";

interface AutomationConfig {
  rootDir: string;
  syncInterval: number;
  logLevel: "debug" | "info" | "warn" | "error";
}

export class AutomationRunner {
  private automationControl: AutomationControl;
  private communicationControl: CommunicationControl;
  private config: AutomationConfig;

  constructor(config: AutomationConfig) {
    this.config = config;
    this.automationControl = new AutomationControl(config.rootDir);
    this.communicationControl = new CommunicationControl();

    this.setupLogging();
    this.initializeControls();
  }

  private setupLogging(): void {
    console.log(`[AutomationRunner] 초기화 시작 - ${new Date().toISOString()}`);
    console.log(`[AutomationRunner] 루트 디렉토리: ${this.config.rootDir}`);
  }

  private async initializeControls(): Promise<void> {
    try {
      // 통신 설정 초기화
      this.communicationControl.setSyncConfig({
        interval: this.config.syncInterval,
        strategy: "immediate",
      });

      // 디렉토리 구조 검증
      const isValid = await this.automationControl.validateItemStructure(
        this.config.rootDir
      );
      if (!isValid) {
        throw new Error("디렉토리 구조 검증 실패");
      }

      console.log("[AutomationRunner] 컨트롤 초기화 완료");
    } catch (error) {
      console.error("[AutomationRunner] 초기화 오류:", error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      console.log("[AutomationRunner] 자동화 시스템 시작");

      // 매뉴얼 생성
      await this.automationControl.generateAllManuals();

      // 변경 감지 시작
      await Promise.all([
        this.automationControl.monitorChanges(),
        this.communicationControl.monitorChanges(this.config.rootDir),
      ]);

      console.log("[AutomationRunner] 변경 감지 시작됨");
    } catch (error) {
      console.error("[AutomationRunner] 시작 오류:", error);
      throw error;
    }
  }

  public async validateAll(): Promise<boolean> {
    try {
      const scriptsDir = path.join(this.config.rootDir, "scripts");

      // 스크립트 검증
      const scriptValid = await this.automationControl.validateScript(
        scriptsDir
      );
      if (!scriptValid) {
        console.warn("[AutomationRunner] 스크립트 검증 실패");
        return false;
      }

      // 디렉토리 구조 검증
      const structureValid = await this.automationControl.validateItemStructure(
        this.config.rootDir
      );
      if (!structureValid) {
        console.warn("[AutomationRunner] 디렉토리 구조 검증 실패");
        return false;
      }

      console.log("[AutomationRunner] 전체 검증 완료");
      return true;
    } catch (error) {
      console.error("[AutomationRunner] 검증 오류:", error);
      return false;
    }
  }

  public getAutomationControl(): AutomationControl {
    return this.automationControl;
  }

  public getCommunicationControl(): CommunicationControl {
    return this.communicationControl;
  }
}

// 사용 예제
const config: AutomationConfig = {
  rootDir: path.join(__dirname, "../../"),
  syncInterval: 5000,
  logLevel: "info",
};

const runner = new AutomationRunner(config);
runner.start().catch(console.error);
