import { AutomationController } from "../control/automation-controller";
import { CommunicationController } from "../control/communication-controller";
import * as path from "path";

interface MCPConfig {
  rootDir: string;
  syncInterval: number;
  logLevel: "debug" | "info" | "warn" | "error";
}

class MCPRunner {
  private automationController: AutomationController;
  private communicationController: CommunicationController;
  private config: MCPConfig;

  constructor(config: MCPConfig) {
    this.config = config;
    this.automationController = new AutomationController(config.rootDir);
    this.communicationController = new CommunicationController();

    this.setupCommunication();
    this.setupLogging();
  }

  private setupCommunication(): void {
    this.communicationController.setSyncConfig({
      interval: this.config.syncInterval,
      strategy: "immediate",
    });
  }

  private setupLogging(): void {
    const logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    const log = (
      level: keyof typeof logLevels,
      message: string,
      ...args: any[]
    ): void => {
      if (logLevels[level] >= logLevels[this.config.logLevel]) {
        const timestamp = new Date().toISOString();
        console[level](`[${timestamp}] ${message}`, ...args);
      }
    };

    global.console = {
      ...console,
      debug: (message: string, ...args: any[]) =>
        log("debug", message, ...args),
      info: (message: string, ...args: any[]) => log("info", message, ...args),
      warn: (message: string, ...args: any[]) => log("warn", message, ...args),
      error: (message: string, ...args: any[]) =>
        log("error", message, ...args),
    };
  }

  public async start(): Promise<void> {
    try {
      console.log("=== MCP 중앙 관제 시스템 시작 ===");
      console.log(`실행 시간: ${new Date().toLocaleString()}`);
      console.log(`루트 디렉토리: ${this.config.rootDir}`);
      console.log("================================");

      // 자동화 시스템 시작
      await this.automationController.startMonitoring();

      // 통신 시스템 시작
      await this.communicationController.startMonitoring(this.config.rootDir);

      // 신규 아이템 생성 예제
      await this.createNewItem("figma-automation");

      console.log("=== 시스템 실행 중 ===");
      console.log("종료하려면 Ctrl+C를 누르세요.");
    } catch (error) {
      console.error("시스템 시작 오류:", error);
      process.exit(1);
    }
  }

  private async createNewItem(itemName: string): Promise<void> {
    try {
      await this.automationController.createNewItem(itemName);
      console.log(`새 아이템 생성됨: ${itemName}`);
    } catch (error) {
      console.error("아이템 생성 오류:", error);
    }
  }

  public stop(): void {
    this.communicationController.stopMonitoring();
    console.log("시스템이 종료되었습니다.");
  }
}

// 실행 예제
const config: MCPConfig = {
  rootDir: path.join(__dirname, "../.."),
  syncInterval: 5000,
  logLevel: "info",
};

const runner = new MCPRunner(config);

// 종료 시그널 처리
process.on("SIGINT", () => {
  runner.stop();
  process.exit(0);
});

// 시스템 시작
runner.start().catch(console.error);
