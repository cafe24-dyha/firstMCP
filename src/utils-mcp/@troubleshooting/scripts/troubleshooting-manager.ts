import * as fs from "fs/promises";
import * as path from "path";
import { EventEmitter } from "events";
import { exec } from "child_process";
import { promisify } from "util";
import { githubDeployer } from "./utils/github-deployer";
import { watch } from "fs";

const execAsync = promisify(exec);

interface ErrorHistoryItem {
  id: string;
  timestamp: number;
  category: string;
  message: string;
  stack?: string;
  resolved: boolean;
  autoFixed: boolean;
  resolution?: string;
}

interface ErrorCategory {
  name: string;
  pattern: RegExp;
  autoFix?: boolean;
  resolution?: string;
}

interface ScriptInfo {
  filename: string;
  functions: string[];
  dependencies: string[];
  description: string;
  errors: string[];
  classes: string[];
  interfaces: string[];
  exports: string[];
}

interface Template {
  name: string;
  pattern: RegExp | string;
  solution: string;
  autoFix?: boolean;
  fixScript?: string;
}

interface GitHubConfig {
  enabled: boolean;
  repository: string;
  branch: string;
  commitMessage: string;
  autoMerge: boolean;
}

class ErrorLogger {
  private logPath: string;

  constructor(logPath: string) {
    this.logPath = logPath;
  }

  async log(error: ErrorHistoryItem): Promise<void> {
    const logEntry = JSON.stringify(error);
    await fs.appendFile(this.logPath, logEntry + "\n");
  }
}

class ErrorFixer {
  async fix(
    _error: ErrorHistoryItem,
    _options: Record<string, unknown>
  ): Promise<boolean> {
    // 자동 수정 로직 구현
    return false;
  }
}

class ErrorHandler {
  async handle(_error: Error): Promise<void> {
    // 에러 처리 로직 구현
  }
}

export class TroubleshootingManager extends EventEmitter {
  private targetDir: string;
  private manualPath: string;
  private scriptsPath: string;
  private templatePath: string;
  private errorHistory: ErrorHistoryItem[] = [];
  private errorCategories: ErrorCategory[] = [];
  private templates: Map<string, Template> = new Map();
  private errorHandler: ErrorHandler;
  private errorLogger: ErrorLogger;
  private errorFixer: ErrorFixer;
  private startTime: number = 0;
  private errorCount: number = 0;
  private readonly MAX_ERRORS = 100;
  private readonly MAX_RECOVERY_ATTEMPTS = 3;
  private gitConfig: GitHubConfig;
  private deploymentHistory: Array<{
    timestamp: number;
    issue: string;
    success: boolean;
    commitHash?: string;
    error?: string;
  }>;
  private readonly TIMEOUT_MS = 300000; // 5분
  private timeoutTimer: NodeJS.Timeout | null = null;
  private fileWatcher: fs.FSWatcher | null = null;

  constructor(targetDir: string) {
    super();
    this.targetDir = targetDir;
    this.manualPath = path.join(targetDir, "manuals");
    this.scriptsPath = path.join(targetDir, "scripts");
    this.templatePath = path.join(targetDir, "scripts", "template");
    this.errorHandler = new ErrorHandler();
    this.errorLogger = new ErrorLogger(path.join(targetDir, "error.log"));
    this.errorFixer = new ErrorFixer();
    this.initializeCategories();
    this.setupErrorListeners();
    this.gitConfig = {
      enabled: true,
      repository: "",
      branch: "main",
      commitMessage: "fix: 자동 오류 수정 및 트러블슈팅 가이드 업데이트",
      autoMerge: false,
    };
    this.deploymentHistory = [];

    // GitHub 배포 설정 초기화
    githubDeployer.updateConfig({
      branch: "main",
      commitMessage: "fix(troubleshooting): 자동 오류 수정 및 가이드 업데이트",
    });
  }

  private setupErrorListeners(): void {
    // 에러 이벤트 리스너
    this.on("error", async (error: Error) => {
      await this.handleError(error);
    });

    // 프로세스 전역 에러 리스너
    process.on("uncaughtException", async (error: Error) => {
      await this.handleError(error);
    });

    process.on("unhandledRejection", async (reason: unknown) => {
      if (reason instanceof Error) {
        await this.handleError(reason);
      }
    });

    // 파일 시스템 에러 리스너
    process.on("warning", async (warning: Error) => {
      if (warning.name === "ExperimentalWarning") return;
      await this.handleError(warning);
    });
  }

  private async initializeTemplates(): Promise<void> {
    try {
      // 템플릿 디렉토리 생성
      await fs.mkdir(this.templatePath, { recursive: true });

      // 기본 템플릿 생성
      const defaultTemplates: Template[] = [
        {
          name: "TypeScript 컴파일 에러",
          pattern: /TS\d+:/,
          solution: "TypeScript 설정을 확인하고 타입 오류를 수정하세요.",
          autoFix: false,
        },
        {
          name: "Figma API 에러",
          pattern: /figma\..*not found/i,
          solution: "Figma 플러그인 API 호출을 확인하세요.",
          autoFix: true,
          fixScript: "checkAndUpdateFigmaAPI",
        },
      ];

      // 템플릿 파일 저장
      await fs.writeFile(
        path.join(this.templatePath, "error-templates.json"),
        JSON.stringify(defaultTemplates, null, 2)
      );

      defaultTemplates.forEach((template) => {
        this.templates.set(template.name, template);
      });
    } catch (error) {
      console.error("템플릿 초기화 중 오류:", error);
    }
  }

  private async loadTemplates(): Promise<void> {
    try {
      const templateFile = path.join(this.templatePath, "error-templates.json");
      const content = await fs.readFile(templateFile, "utf-8");
      const loadedTemplates = JSON.parse(content);
      loadedTemplates.forEach((template: Template) => {
        this.templates.set(template.name, template);
      });
    } catch (error) {
      console.error("템플릿 로드 중 오류:", error);
      // 템플릿 파일이 없으면 초기화
      await this.initializeTemplates();
    }
  }

  private async createNewTemplate(
    error: Error,
    solution: string
  ): Promise<void> {
    const templateName = `${error.name} 에러`;
    const pattern = this.extractErrorPattern(error.message);

    const newTemplate: Template = {
      name: templateName,
      pattern: pattern,
      solution: solution,
      autoFix: false,
    };

    const templatesPath = path.join(this.templatePath, "error-templates.json");
    let templates: Template[] = [];

    try {
      const content = await fs.readFile(templatesPath, "utf-8");
      templates = JSON.parse(content);
    } catch (error) {
      console.error("템플릿 파일 읽기 실패:", error);
    }

    // 중복 체크
    const isDuplicate = templates.some((t) => t.pattern === pattern);
    if (!isDuplicate) {
      templates.push(newTemplate);
      await fs.writeFile(templatesPath, JSON.stringify(templates, null, 2));
      console.log(`✅ 새로운 템플릿 생성됨: ${templateName}`);
    }
  }

  private extractErrorPattern(message: string): string {
    // 에러 메시지에서 패턴 추출
    const words = message.split(/\s+/);
    const significantWords = words
      .filter(
        (word) => word.length > 3 && !word.includes("/") && !word.includes("\\")
      )
      .slice(0, 3);

    return significantWords.join(".*");
  }

  private async saveTemplates(): Promise<void> {
    try {
      const templateArray = Array.from(this.templates.values());
      await fs.writeFile(
        path.join(this.templatePath, "error-templates.json"),
        JSON.stringify(templateArray, null, 2)
      );
    } catch (error) {
      console.error("템플릿 저장 중 오류:", error);
    }
  }

  public async startWatching(): Promise<void> {
    console.log("📡 트러블슈팅 매니저 시작 중...");

    await this.initialize();
    this.startFileWatcher();

    console.log("🔄 트러블슈팅 시스템 준비 완료");
    console.log(`📁 스크립트 폴더: ${this.targetDir}`);
    console.log(`📁 매뉴얼 폴더: ${this.manualPath}`);
    console.log(`🔄 최대 오류 수: ${this.MAX_ERRORS}`);
    console.log(`🔄 최대 복구 시도: ${this.MAX_RECOVERY_ATTEMPTS}`);
    console.log(
      `🚀 GitHub 자동 배포: ${
        githubDeployer.isEnabled() ? "활성화" : "비활성화"
      }`
    );
    console.log("⚠️ 오류 발생 시 자동으로 감지하여 처리합니다.");
  }

  private startFileWatcher(): void {
    if (this.fileWatcher) {
      this.fileWatcher.close();
    }

    this.fileWatcher = watch(
      this.scriptsPath,
      { recursive: true },
      async (eventType, filename) => {
        if (!filename) return;

        console.log(`📝 파일 변경 감지: ${filename}`);
        if (filename.endsWith(".ts") || filename.endsWith(".js")) {
          try {
            const filePath = path.join(this.scriptsPath, filename);
            const content = await fs.readFile(filePath, "utf-8");
            const scriptInfo = this.analyzeScript(content, filename);
            await this.updateManualWithScript(scriptInfo);
            console.log(`✅ 매뉴얼 업데이트 완료: ${filename}`);
          } catch (error) {
            if (error instanceof Error) {
              await this.handleError(error);
            }
          }
        }
      }
    );

    console.log(`👀 파일 변경 감지 시작: ${this.scriptsPath}`);
  }

  private async handleError(error: Error): Promise<void> {
    try {
      const category = this.categorizeError(error);
      const template = this.findMatchingTemplate(error);
      const isDuplicate = this.checkDuplicate(error);

      if (!isDuplicate) {
        this.errorCount++;
        console.log(`\n🚨 에러 감지됨 (${this.errorCount}/${this.MAX_ERRORS})`);
        console.log(`- 유형: ${category.name}`);
        console.log(`- 메시지: ${error.message}`);

        if (template) {
          console.log(`- 해결방법: ${template.solution}`);
        }

        await this.errorHandler.handle(error);
        await this.addToHistory(error, category);

        if (this.errorCount >= this.MAX_ERRORS) {
          console.log("\n❌ 최대 에러 수 초과로 종료합니다.");
          await this.stopWatching();
          process.exit(1);
        }

        const shouldAutoFix = template?.autoFix || category.autoFix;
        const fixedFiles: string[] = [];

        if (shouldAutoFix) {
          let attempts = 0;
          let fixed = false;

          while (attempts < this.MAX_RECOVERY_ATTEMPTS && !fixed) {
            attempts++;
            console.log(
              `\n⏳ 복구 시도 ${attempts}/${this.MAX_RECOVERY_ATTEMPTS}`
            );

            fixed = await this.attemptAutoFix(error, category, template);

            if (fixed) {
              this.markErrorResolved(error, "auto-fix");
              console.log(`✅ 복구 성공: ${error.message}`);

              // 파일 정보 추가
              let targetFile = "";
              try {
                // 에러 메시지에서 파일 경로 추출
                const filePathMatch = error.message.match(
                  /(?:in|at|file)\s+['"]?([^'":\s]+\.(?:js|ts|tsx|jsx))['"]?/i
                );
                if (filePathMatch && filePathMatch[1]) {
                  targetFile = filePathMatch[1];
                  fixedFiles.push(targetFile);
                }
              } catch (error) {
                console.error("파일 경로 추출 중 오류:", error);
              }

              // 성공한 해결책을 템플릿으로 저장
              if (!template) {
                await this.createNewTemplate(error, "자동 복구 성공");
              }

              // GitHub 자동 배포
              const troubleshootingManualPath = path.join(
                this.manualPath,
                "troubleshooting.md"
              );
              await githubDeployer.deploy(
                `트러블슈팅: ${category.name} - ${error.message}`,
                fixedFiles,
                troubleshootingManualPath
              );

              break;
            } else if (attempts < this.MAX_RECOVERY_ATTEMPTS) {
              console.log(`❌ 복구 실패, 재시도 예정: ${error.message}`);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
              console.log(
                `❌ 최대 시도 횟수 초과, 수동 해결 필요: ${error.message}`
              );
            }
          }
        }

        await this.logError(error, category);
        await this.checkAndUpdateManual();
      } else {
        console.log(`\n⚠️ 중복 에러 무시됨: ${error.message}`);
      }
    } catch (handlingError) {
      console.error("에러 처리 중 오류:", handlingError);
    }
  }

  private categorizeError(error: Error): ErrorCategory {
    for (const category of this.errorCategories) {
      if (
        category.pattern.test(error.message) ||
        category.pattern.test(error.stack || "")
      ) {
        return category;
      }
    }

    return {
      name: "Other",
      pattern: /.*/,
      autoFix: false,
    };
  }

  private async logError(error: Error, category: ErrorCategory): Promise<void> {
    await this.errorLogger.log({
      id: Date.now().toString(),
      message: error.message,
      stack: error.stack,
      category: category.name,
      timestamp: Date.now(),
      resolved: false,
      autoFixed: false,
    });
  }

  private findMatchingTemplate(error: Error): Template | undefined {
    for (const template of this.templates.values()) {
      try {
        const regex =
          typeof template.pattern === "string"
            ? new RegExp(template.pattern, "i")
            : template.pattern;

        if (regex.test(error.message)) {
          return template;
        }
      } catch (e) {
        console.error(`템플릿 패턴 매칭 오류: ${e}`);
      }
    }
    return undefined;
  }

  private async attemptAutoFix(
    error: Error,
    category: ErrorCategory,
    template?: Template
  ): Promise<boolean> {
    try {
      if (template?.fixScript) {
        // 템플릿의 수정 스크립트 실행
        const fixScriptPath = path.join(
          this.templatePath,
          "fixes",
          template.fixScript + ".ts"
        );
        if (await this.checkFileExists(fixScriptPath)) {
          // 수정 스크립트 동적 실행 로직
          return true;
        }
      }

      // 기본 수정 시도
      return await this.errorFixer.fix(
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          category: category.name,
          message: error.message,
          stack: error.stack,
          resolved: false,
          autoFixed: false,
        },
        {
          category: category.name,
          maxAttempts: this.MAX_RECOVERY_ATTEMPTS,
          template: template,
        }
      );
    } catch (fixError) {
      console.error("자동 수정 중 오류:", fixError);
      return false;
    }
  }

  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private checkDuplicate(error: Error): boolean {
    return this.errorHistory.some(
      (item) =>
        item.message === error.message && Date.now() - item.timestamp < 3600000 // 1시간 이내
    );
  }

  private markErrorResolved(error: Error, method: string): void {
    const errorIndex = this.errorHistory.findIndex(
      (item) => item.message === error.message
    );

    if (errorIndex !== -1) {
      this.errorHistory[errorIndex].resolved = true;
      this.errorHistory[errorIndex].resolution = method;
    }
  }

  private async addToHistory(
    error: Error,
    category: ErrorCategory
  ): Promise<void> {
    const historyItem: ErrorHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      category: category.name,
      message: error.message,
      stack: error.stack,
      resolved: false,
      autoFixed: false,
    };

    this.errorHistory.push(historyItem);
    await this.checkAndUpdateManual();
  }

  public async stopWatching(): Promise<void> {
    try {
      const runtime = Math.floor((Date.now() - this.startTime) / 60000);

      console.log("\n=== 최종 실행 결과 ===");
      console.log(`- 총 실행 시간: ${runtime}분`);
      console.log(`- 총 발생 에러: ${this.errorCount}개`);
      console.log(
        `- 해결된 에러: ${this.errorHistory.filter((e) => e.resolved).length}개`
      );
      console.log(
        `- 자동 복구된 에러: ${
          this.errorHistory.filter((e) => e.autoFixed).length
        }개`
      );
      console.log("=====================\n");

      await this.checkAndUpdateManual();
      console.log("트러블슈팅 시스템 종료됨");
    } catch (error) {
      if (error instanceof Error) {
        await this.handleError(error);
      }
    }
  }

  private initializeCategories(): void {
    this.errorCategories = [
      {
        name: "Figma Plugin",
        pattern: /figma\..*not found/i,
        autoFix: true,
      },
      {
        name: "TypeScript Config",
        pattern: /tsconfig\.json.*error/i,
        autoFix: true,
      },
      {
        name: "React Integration",
        pattern: /react.*component.*error/i,
        autoFix: false,
      },
    ];
  }

  private async checkAndUpdateManual(): Promise<void> {
    const recentErrors = this.errorHistory.filter(
      (error) => Date.now() - error.timestamp < 3600000
    );

    const unresolved = recentErrors.filter((error) => !error.resolved);
    const resolved = recentErrors.filter((error) => error.resolved);
    const autoFixed = recentErrors.filter((error) => error.autoFixed);

    const content = `## 트러블슈팅 현황

### 현재 상태
- 총 감지된 에러: ${this.errorCount}개
- 해결된 에러: ${resolved.length}개
- 자동 복구된 에러: ${autoFixed.length}개
- 미해결 에러: ${unresolved.length}개

### 현재 발생 중인 문제
${unresolved
  .map(
    (error) => `
#### ${error.category}
- **문제**: ${error.message}
- **발생시간**: ${new Date(error.timestamp).toLocaleString("ko-KR")}
- **상태**: 해결 중
${error.stack ? `- **스택 트레이스**:\n\`\`\`\n${error.stack}\n\`\`\`` : ""}`
  )
  .join("\n")}

### 최근 해결된 문제
${resolved
  .map(
    (error) => `
#### ${error.category}
- **문제**: ${error.message}
- **해결방법**: ${error.resolution}
- **해결시간**: ${new Date(error.timestamp).toLocaleString("ko-KR")}
${error.autoFixed ? "- **자동 복구됨**" : ""}`
  )
  .join("\n")}

### 자동 복구 통계
- **성공률**: ${
      resolved.length > 0
        ? Math.round((autoFixed.length / resolved.length) * 100)
        : 0
    }%
- **평균 시도 횟수**: ${
      resolved.length > 0 ? Math.round(this.errorCount / resolved.length) : 0
    }회
`;

    const manualFile = path.join(this.manualPath, "troubleshooting.md");
    const existingContent = await fs.readFile(manualFile, "utf-8");
    const header = existingContent.split("## 트러블슈팅 현황")[0];

    await fs.writeFile(manualFile, header + "\n" + content);
  }

  private async initializeManual(): Promise<void> {
    try {
      await fs.mkdir(this.manualPath, { recursive: true });
      const manualFile = path.join(this.manualPath, "troubleshooting.md");

      const initialContent = `# MCP 트러블슈팅 시스템 매뉴얼

## 시스템 개요
- **목적**: MCP 시스템의 에러를 자동으로 감지하고 해결하는 자율 트러블슈팅 시스템
- **위치**: \`@troubleshooting/scripts/\`
- **처리 결과**: \`@troubleshooting/manuals/troubleshooting.md\`

## 주요 기능
1. **에러 감지 및 분류**
   - 실시간 에러 모니터링
   - 에러 유형 자동 분류
   - 중복 에러 필터링

2. **자동 복구 시스템**
   - 최대 ${this.MAX_RECOVERY_ATTEMPTS}회 복구 시도
   - 템플릿 기반 자동 복구
   - 복구 성공/실패 기록

3. **매뉴얼 자동 업데이트**
   - 에러 발생 시 실시간 업데이트
   - 해결 방법 자동 기록
   - 복구 이력 관리

## 에러 카테고리
${this.errorCategories
  .map(
    (cat) => `### ${cat.name}
- **패턴**: \`${cat.pattern}\`
- **자동복구**: ${cat.autoFix ? "가능" : "불가능"}
${cat.resolution ? `- **해결방법**: ${cat.resolution}` : ""}`
  )
  .join("\n\n")}

## 스크립트 구성
`;

      await fs.writeFile(manualFile, initialContent);
    } catch (error) {
      console.error("매뉴얼 초기화 중 오류:", error);
      throw error;
    }
  }

  private async processScripts(): Promise<void> {
    try {
      const files = await fs.readdir(this.scriptsPath);
      const scriptFiles = files.filter(
        (file) => file.endsWith(".ts") || file.endsWith(".js")
      );

      console.log(`\n스크립트 파일 처리 중... (총 ${scriptFiles.length}개)`);

      for (const file of scriptFiles) {
        try {
          const filePath = path.join(this.scriptsPath, file);
          const content = await fs.readFile(filePath, "utf-8");

          // 스크립트 내용 분석
          const scriptInfo = this.analyzeScript(content, file);
          await this.updateManualWithScript(scriptInfo);

          console.log(`✅ 처리 완료: ${file}`);
        } catch (error) {
          if (error instanceof Error) {
            await this.handleError(error);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        await this.handleError(error);
      }
    }
  }

  private analyzeScript(content: string, filename: string): ScriptInfo {
    const info: ScriptInfo = {
      filename,
      functions: [],
      dependencies: [],
      description: "",
      errors: [],
      classes: [],
      interfaces: [],
      exports: [],
    };

    try {
      // 함수 추출 (일반 함수와 화살표 함수)
      const functionMatches =
        content.match(
          /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g
        ) || [];
      info.functions = functionMatches
        .map((m) => {
          const name =
            m.match(/function\s+(\w+)|const\s+(\w+)/)?.[1] ||
            m.match(/const\s+(\w+)/)?.[1] ||
            "";
          return name;
        })
        .filter(Boolean);

      // 클래스 추출
      const classMatches = content.match(/class\s+(\w+)/g) || [];
      info.classes = classMatches.map((m) => m.replace("class ", ""));

      // 인터페이스 추출
      const interfaceMatches = content.match(/interface\s+(\w+)/g) || [];
      info.interfaces = interfaceMatches.map((m) =>
        m.replace("interface ", "")
      );

      // export 항목 추출
      const exportMatches =
        content.match(
          /export\s+(?:class|interface|const|function|type)\s+(\w+)/g
        ) || [];
      info.exports = exportMatches
        .map((m) => m.split(/\s+/).pop() || "")
        .filter(Boolean);

      // 의존성 추출
      const importMatches =
        content.match(/import\s+.*?from\s+['"](.+?)['"]/g) || [];
      info.dependencies = importMatches.map(
        (m) => m.match(/from\s+['"](.+?)['"]/)?.[1] || ""
      );

      // 설명 추출 (JSDoc 포함)
      const descMatches = content.match(/\/\*\*[\s\S]*?\*\/|\/\/\s*.+/g) || [];
      info.description = descMatches
        .map((m) => m.replace(/\/\*\*|\*\/|\*\s*|\/\/\s*/g, " ").trim())
        .filter(Boolean)
        .join("\n");

      // 에러 처리 패턴 추출
      const errorMatches =
        content.match(/catch\s*\((.*?)\)\s*{[\s\S]*?}/g) || [];
      info.errors = errorMatches.map((m) => {
        const errorType = m.match(/catch\s*\((.*?)\)/)?.[1] || "Error";
        const errorHandling = m.match(/{([\s\S]*?)}/)?.[1] || "";
        return `${errorType}: ${errorHandling.trim().split("\n")[0]}`;
      });
    } catch (error) {
      console.error(`스크립트 분석 중 오류 (${filename}):`, error);
    }

    return info;
  }

  private async updateManualWithScript(scriptInfo: ScriptInfo): Promise<void> {
    const content = `### ${scriptInfo.filename}
${scriptInfo.description ? `\n${scriptInfo.description}\n` : ""}

#### 주요 기능
${
  scriptInfo.functions.length > 0
    ? scriptInfo.functions.map((f) => `- \`${f}\`: 함수`).join("\n")
    : "- 없음"
}

#### 구성요소
- **클래스**: ${
      scriptInfo.classes.length > 0
        ? scriptInfo.classes.map((c) => `\`${c}\``).join(", ")
        : "없음"
    }
- **인터페이스**: ${
      scriptInfo.interfaces.length > 0
        ? scriptInfo.interfaces.map((i) => `\`${i}\``).join(", ")
        : "없음"
    }
- **내보내기**: ${
      scriptInfo.exports.length > 0
        ? scriptInfo.exports.map((e) => `\`${e}\``).join(", ")
        : "없음"
    }

#### 의존성
${
  scriptInfo.dependencies.length > 0
    ? scriptInfo.dependencies.map((d) => `- \`${d}\``).join("\n")
    : "- 없음"
}

#### 에러 처리
${
  scriptInfo.errors.length > 0
    ? scriptInfo.errors.map((e) => `- ${e}`).join("\n")
    : "- 기본 에러 처리"
}

---
`;

    const manualFile = path.join(this.manualPath, "troubleshooting.md");
    const existingContent = await fs.readFile(manualFile, "utf-8");

    if (!existingContent.includes(`### ${scriptInfo.filename}`)) {
      await fs.writeFile(manualFile, existingContent + "\n" + content);
    }
  }

  /**
   * 디렉토리 확인 및 생성
   */
  private async ensureDirectories(): Promise<void> {
    try {
      // 매뉴얼 디렉토리 확인
      await fs.mkdir(this.manualPath, { recursive: true });
      console.log(`📁 매뉴얼 디렉토리 확인: ${this.manualPath}`);

      // 템플릿 디렉토리 확인
      await fs.mkdir(this.templatePath, { recursive: true });
      console.log(`📁 템플릿 디렉토리 확인: ${this.templatePath}`);
    } catch (error) {
      console.error("❌ 디렉토리 확인 중 오류:", error);
      throw new Error("디렉토리 생성 실패");
    }
  }

  /**
   * GitHub 배포 설정 업데이트
   */
  public updateGitHubConfig(
    config: Partial<import("./utils/github-deployer").GitHubConfig>
  ): void {
    githubDeployer.updateConfig(config);
  }

  /**
   * GitHub 배포 활성화/비활성화
   */
  public setGitHubDeploymentEnabled(enabled: boolean): void {
    githubDeployer.setEnabled(enabled);
  }

  /**
   * GitHub 배포 이력 조회
   */
  public getGitHubDeploymentHistory(): Array<{
    timestamp: number;
    issue: string;
    success: boolean;
    commitHash?: string;
    error?: string;
  }> {
    return githubDeployer.getDeploymentHistory();
  }

  private startTimeoutTimer(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }

    this.timeoutTimer = setTimeout(() => {
      console.log("⚠️ 작업 시간 초과로 자동 종료됩니다.");
      this.cleanup();
      process.exit(0);
    }, this.TIMEOUT_MS);
  }

  private resetTimeoutTimer(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.startTimeoutTimer();
    }
  }

  private cleanup(): void {
    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = null;
    }
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    this.saveTemplates();
    this.updateManual();
  }

  public async start(): Promise<void> {
    try {
      await this.initialize();
      this.startTimeoutTimer();

      process.on("SIGINT", () => {
        console.log("\n🛑 프로그램 종료 요청됨");
        this.cleanup();
        process.exit(0);
      });

      // 작업 시작
      await this.watchErrors();
    } catch (error) {
      console.error("❌ 시스템 시작 실패:", error);
      this.cleanup();
      process.exit(1);
    }
  }

  private async initialize(): Promise<void> {
    await this.ensureDirectories();
    await this.initializeTemplates();
    await this.initializeManual();
    this.setupErrorListeners();
    this.startTime = Date.now();
  }

  private async watchErrors(): Promise<void> {
    try {
      await this.processScripts();
      console.log("\n트러블슈팅 가이드 생성기가 실행 중입니다.");
      console.log("종료하려면 Ctrl+C를 누르세요...");
    } catch (error) {
      if (error instanceof Error) {
        await this.handleError(error);
      }
    }
  }

  private async updateManual(): Promise<void> {
    await this.checkAndUpdateManual();
  }
}
