import { EventEmitter } from "events";
import * as fs from "fs/promises";
import * as path from "path";
import { ManualGenerator } from "./manual-generator";

interface ItemChangeData {
  itemPath: string;
  type: "add" | "change";
}

interface ScriptUpdateData {
  scriptPath: string;
  type: "update";
}

interface AutomationPrinciples {
  naming: {
    pattern: string;
    rules: string[];
  };
  directory: {
    structure: string[];
    conventions: string[];
  };
  communication: {
    protocol: string;
    events: string[];
    sync: {
      interval: number;
      strategy: string;
    };
  };
}

export class AutomationControl {
  private eventEmitter: EventEmitter;
  private principles: AutomationPrinciples;
  private rootDir: string;
  private manualGenerator: ManualGenerator;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.eventEmitter = new EventEmitter();
    this.manualGenerator = new ManualGenerator(rootDir);

    this.principles = {
      naming: {
        pattern: "^[a-z-]+\\.(ts|md|json)$",
        rules: ["소문자와 하이픈만 사용", "확장자는 .ts, .md 또는 .json"],
      },
      directory: {
        structure: ["scripts", "templates", "manuals"],
        conventions: ["기능별 디렉터리 분리", "공통 컴포넌트는 common에 위치"],
      },
      communication: {
        protocol: "event-based",
        events: ["itemChange", "manualUpdate", "scriptUpdate"],
        sync: {
          interval: 5000,
          strategy: "immediate",
        },
      },
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventEmitter.on("itemChange", async (data: ItemChangeData) => {
      await this.validateItemStructure(data.itemPath);

      // 템플릿 변경 시 매뉴얼 업데이트
      if (
        data.itemPath.includes("templates") &&
        data.itemPath.endsWith(".json")
      ) {
        const templateName = path.basename(data.itemPath, ".json");
        await this.manualGenerator.generateManual(templateName);
      }
    });

    this.eventEmitter.on("scriptUpdate", async (data: ScriptUpdateData) => {
      await this.validateScript(data.scriptPath);
    });
  }

  public async validateItemStructure(itemPath: string): Promise<boolean> {
    try {
      // 디렉터리 구조 검증
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        for (const dir of this.principles.directory.structure) {
          const dirPath = path.join(itemPath, dir);
          try {
            const dirStats = await fs.stat(dirPath);
            if (!dirStats.isDirectory()) {
              console.warn(`Warning: ${dirPath} exists but is not a directory`);
            }
          } catch (err) {
            await fs.mkdir(dirPath, { recursive: true });
          }
        }
      }

      // 네이밍 규칙 검증
      const pattern = new RegExp(this.principles.naming.pattern);
      const files = await fs.readdir(itemPath);

      for (const file of files) {
        const filePath = path.join(itemPath, file);
        const fileStats = await fs.stat(filePath);

        if (fileStats.isFile()) {
          // 파일만 검사
          if (!pattern.test(file)) {
            console.warn(`Warning: ${file} does not follow naming convention`);
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error validating item structure:", error);
      return false;
    }
  }

  public async validateScript(scriptPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(scriptPath);

      if (stats.isDirectory()) {
        const files = await fs.readdir(scriptPath);
        let allValid = true;

        for (const file of files) {
          if (file.endsWith(".ts")) {
            const filePath = path.join(scriptPath, file);
            const content = await fs.readFile(filePath, "utf-8");
            const filename = path.basename(filePath);

            // 파일명 검증
            if (!new RegExp(this.principles.naming.pattern).test(filename)) {
              console.warn(
                `Warning: Script ${filename} does not follow naming convention`
              );
              allValid = false;
            }

            // 기본 구조 검증
            const requiredPatterns = [
              /export\s+class/,
              /constructor/,
              /async\s+execute/,
            ];

            for (const pattern of requiredPatterns) {
              if (!pattern.test(content)) {
                console.warn(
                  `Warning: Script ${filename} missing required pattern: ${pattern}`
                );
                allValid = false;
              }
            }
          }
        }

        return allValid;
      } else {
        const content = await fs.readFile(scriptPath, "utf-8");
        const filename = path.basename(scriptPath);

        // 파일명 검증
        if (!new RegExp(this.principles.naming.pattern).test(filename)) {
          console.warn(
            `Warning: Script ${filename} does not follow naming convention`
          );
          return false;
        }

        // 기본 구조 검증
        const requiredPatterns = [
          /export\s+class/,
          /constructor/,
          /async\s+execute/,
        ];

        for (const pattern of requiredPatterns) {
          if (!pattern.test(content)) {
            console.warn(
              `Warning: Script ${filename} missing required pattern: ${pattern}`
            );
            return false;
          }
        }

        return true;
      }
    } catch (error) {
      console.error("Error validating script:", error);
      return false;
    }
  }

  public async monitorChanges(): Promise<void> {
    const watcher = require("chokidar").watch(this.rootDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
    });

    watcher
      .on("add", (path: string) => {
        this.eventEmitter.emit("itemChange", { itemPath: path, type: "add" });
      })
      .on("change", (path: string) => {
        this.eventEmitter.emit("itemChange", {
          itemPath: path,
          type: "change",
        });
      });
  }

  public getPrinciples(): AutomationPrinciples {
    return this.principles;
  }

  public async generateAllManuals(): Promise<void> {
    try {
      const templates = await fs.readdir(path.join(this.rootDir, "templates"));

      for (const template of templates) {
        if (template.endsWith(".json")) {
          const templateName = path.basename(template, ".json");
          await this.manualGenerator.generateManual(templateName);
        }
      }

      console.log("모든 매뉴얼 생성 완료");
    } catch (error) {
      console.error("매뉴얼 생성 오류:", error);
      throw error;
    }
  }
}
