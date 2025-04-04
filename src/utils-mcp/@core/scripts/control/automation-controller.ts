import { EventEmitter } from "events";
import * as fs from "fs/promises";
import * as path from "path";

interface AutomationItem {
  name: string;
  type: "core" | "templates" | "automation";
  status: "active" | "inactive" | "error";
  lastUpdate: Date;
}

interface MonitoringMetrics {
  itemCount: number;
  activeItems: number;
  errorCount: number;
  lastCheck: Date;
}

interface TemplateData {
  title: string;
  sections: {
    title: string;
    content: string;
    subsections?: {
      title: string;
      content: string;
    }[];
  }[];
}

export class AutomationController {
  private eventEmitter: EventEmitter;
  private rootDir: string;
  private items: Map<string, AutomationItem>;
  private metrics: MonitoringMetrics;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.eventEmitter = new EventEmitter();
    this.items = new Map();
    this.metrics = {
      itemCount: 0,
      activeItems: 0,
      errorCount: 0,
      lastCheck: new Date(),
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // 아이템 변경 감지
    this.eventEmitter.on("itemChange", async (itemPath: string) => {
      await this.validateItemStructure(itemPath);
      await this.updateItemStatus(itemPath);
    });

    // 템플릿 변경 감지
    this.eventEmitter.on("templateChange", async (templatePath: string) => {
      if (templatePath.startsWith("templates-manuals")) {
        await this.generateManual(templatePath);
      }
    });

    // 최적화 모니터링
    this.eventEmitter.on("optimizationCheck", async () => {
      await this.checkOptimization();
    });
  }

  private async validateItemStructure(itemPath: string): Promise<boolean> {
    try {
      const requiredDirs = ["scripts", "manuals"];

      for (const dir of requiredDirs) {
        const dirPath = path.join(itemPath, dir);
        await fs.mkdir(dirPath, { recursive: true });
      }

      return true;
    } catch (error) {
      console.error("디렉토리 구조 검증 오류:", error);
      return false;
    }
  }

  private async updateItemStatus(itemPath: string): Promise<void> {
    const name = path.basename(itemPath);
    const type = this.getItemType(itemPath);

    const item: AutomationItem = {
      name,
      type,
      status: "active",
      lastUpdate: new Date(),
    };

    this.items.set(name, item);
    await this.updateMetrics();
  }

  private getItemType(itemPath: string): "core" | "templates" | "automation" {
    if (itemPath.includes("core")) return "core";
    if (itemPath.includes("templates")) return "templates";
    return "automation";
  }

  private async updateMetrics(): Promise<void> {
    this.metrics = {
      itemCount: this.items.size,
      activeItems: Array.from(this.items.values()).filter(
        (item) => item.status === "active"
      ).length,
      errorCount: Array.from(this.items.values()).filter(
        (item) => item.status === "error"
      ).length,
      lastCheck: new Date(),
    };
  }

  private async checkOptimization(): Promise<boolean> {
    const isOptimized =
      this.metrics.errorCount === 0 &&
      this.metrics.activeItems === this.metrics.itemCount;

    if (!isOptimized) {
      console.log("최적화 필요:", {
        totalItems: this.metrics.itemCount,
        activeItems: this.metrics.activeItems,
        errors: this.metrics.errorCount,
      });
    }

    return isOptimized;
  }

  public async createNewItem(itemName: string): Promise<void> {
    const itemPath = path.join(this.rootDir, itemName);

    try {
      // 디렉토리 생성
      await this.validateItemStructure(itemPath);

      // 기본 파일 생성
      await fs.writeFile(
        path.join(itemPath, "scripts", "index.ts"),
        `export * from './control';\nexport * from './main';\n`
      );

      // 상태 업데이트
      await this.updateItemStatus(itemPath);

      console.log(`새 아이템 생성 완료: ${itemName}`);
    } catch (error) {
      console.error("아이템 생성 오류:", error);
      throw error;
    }
  }

  public async startMonitoring(): Promise<void> {
    const checkInterval = 5000; // 5초

    const monitor = async () => {
      const isOptimized = await this.checkOptimization();

      if (!isOptimized) {
        // 최적화가 필요한 경우 이벤트 발생
        this.eventEmitter.emit("optimizationCheck");

        // 재귀적으로 모니터링 계속
        setTimeout(monitor, checkInterval);
      } else {
        console.log("모든 아이템이 최적화되었습니다.");
      }
    };

    // 모니터링 시작
    monitor();
  }

  public async generateManual(templatePath: string): Promise<void> {
    try {
      const content = await fs.readFile(templatePath, "utf-8");
      const template = JSON.parse(content);

      const manualPath = templatePath
        .replace("templates-manuals/scripts", "templates-manuals/manuals")
        .replace(".json", ".md");

      // 마크다운 생성
      const markdown = this.generateMarkdown(template);
      await fs.writeFile(manualPath, markdown, "utf-8");

      console.log(`매뉴얼 생성 완료: ${path.basename(manualPath)}`);
    } catch (error) {
      console.error("매뉴얼 생성 오류:", error);
      throw error;
    }
  }

  private generateMarkdown(template: TemplateData): string {
    let markdown = `# ${template.title}\n\n`;

    if (template.sections) {
      for (const section of template.sections) {
        markdown += `## ${section.title}\n\n${section.content}\n\n`;

        if (section.subsections) {
          for (const subsection of section.subsections) {
            markdown += `### ${subsection.title}\n\n${subsection.content}\n\n`;
          }
        }
      }
    }

    markdown += `\n---\n마지막 업데이트: ${new Date().toLocaleString()}`;
    return markdown;
  }

  public getMetrics(): MonitoringMetrics {
    return { ...this.metrics };
  }
}
