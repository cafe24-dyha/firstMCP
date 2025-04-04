import { errorHandler } from "./scripts/error-handler";
import * as fs from "fs";
import * as path from "path";

interface MCPConfig {
  mcp: {
    automation: {
      errorHandling: {
        enabled: boolean;
        autoFix: boolean;
        documentation: {
          path: string;
          categories: string[];
        };
        logging: {
          path: string;
          format: string;
        };
      };
    };
  };
}

class MCPErrorIntegration {
  private config: MCPConfig;

  constructor() {
    this.loadConfig();
    this.setupMCPIntegration();
  }

  private loadConfig() {
    const configPath = path.join(process.cwd(), "mcp-config.json");
    this.config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  private setupMCPIntegration() {
    if (!this.config.mcp.automation.errorHandling.enabled) {
      return;
    }

    // MCP 브라우저 도구와 통합
    this.setupBrowserToolsIntegration();

    // 에러 감지 및 처리
    this.setupErrorDetection();

    // 자동 문서화 설정
    this.setupAutomaticDocumentation();
  }

  private setupBrowserToolsIntegration() {
    // 콘솔 에러 감지
    process.on("message", async (message: any) => {
      if (message.type === "browser-error") {
        await errorHandler.handleError(new Error(message.error));
      }
    });
  }

  private setupErrorDetection() {
    // 빌드 에러 감지
    process.on("exit", (code) => {
      if (code !== 0) {
        const error = new Error(`Build failed with exit code: ${code}`);
        errorHandler.handleError(error);
      }
    });

    // TypeScript 컴파일러 에러 감지
    if (process.env.TS_NODE_PROJECT) {
      require("ts-node").register({
        project: process.env.TS_NODE_PROJECT,
        transpileOnly: true,
        compilerOptions: {
          module: "commonjs",
        },
        errorHandler: (error: Error) => {
          errorHandler.handleError(error);
        },
      });
    }
  }

  private setupAutomaticDocumentation() {
    const docPath = this.config.mcp.automation.errorHandling.documentation.path;

    // 자동 문서화 디렉토리 생성
    if (!fs.existsSync(docPath)) {
      fs.mkdirSync(docPath, { recursive: true });
    }

    // 카테고리별 문서 초기화
    this.config.mcp.automation.errorHandling.documentation.categories.forEach(
      (category) => {
        const categoryPath = path.join(docPath, `${category}.md`);
        if (!fs.existsSync(categoryPath)) {
          const template = `# ${category
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}\n\n## 자동 생성된 에러 문서\n\n`;
          fs.writeFileSync(categoryPath, template);
        }
      }
    );
  }

  public async handleMCPError(error: Error) {
    if (this.config.mcp.automation.errorHandling.autoFix) {
      await errorHandler.handleError(error);
    }
  }
}

export const mcpErrorIntegration = new MCPErrorIntegration();
