import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import * as semver from "semver";
import { BaseErrorHandler } from "../../troubleshooting/core/handlers/base-handler";
import {
  BaseErrorCase,
  ErrorContext,
  ErrorFix,
} from "../../troubleshooting/core/types/error-base";

const execAsync = promisify(exec);

export class FigmaSetupChecker extends BaseErrorHandler {
  private projectRoot: string;

  constructor(projectRoot: string) {
    super(path.join(projectRoot, "src/utils/error-cases/docs"));
    this.projectRoot = projectRoot;
  }

  public async checkAll(): Promise<void> {
    try {
      await this.checkEnvironment();
      await this.checkProjectStructure();
      await this.checkConfigFiles();
      await this.checkBuildEnvironment();
      console.log("✅ 모든 점검이 완료되었습니다.");
    } catch (error) {
      await this.handleError(error as Error);
    }
  }

  private async checkEnvironment(): Promise<void> {
    // Node.js 버전 확인
    const nodeVersion = process.version;
    if (!semver.satisfies(nodeVersion, ">=18.0.0")) {
      throw new Error("FE101: Node.js v18 이상이 필요합니다.");
    }

    // npm 확인
    try {
      await execAsync("npm --version");
    } catch {
      throw new Error("FE102: npm이 설치되어 있지 않습니다.");
    }

    // 글로벌 의존성 확인
    const requiredGlobals = ["typescript", "esbuild"];
    for (const pkg of requiredGlobals) {
      try {
        await execAsync(`which ${pkg}`);
      } catch {
        throw new Error(`FE103: ${pkg}가 전역에 설치되어 있지 않습니다.`);
      }
    }
  }

  private async checkProjectStructure(): Promise<void> {
    const requiredFiles = [
      "package.json",
      "manifest.json",
      "tsconfig.json",
      "src/code.ts",
      "src/ui.tsx",
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`FS101: ${file}이(가) 없습니다.`);
      }
    }

    // 디렉토리 구조 확인
    const requiredDirs = ["src", "src/utils", "dist"];
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
  }

  private async checkConfigFiles(): Promise<void> {
    // manifest.json 검증
    const manifestPath = path.join(this.projectRoot, "manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const requiredFields = ["name", "id", "api", "main", "ui"];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        throw new Error(`FC101: manifest.json에 ${field} 필드가 없습니다.`);
      }
    }

    // tsconfig.json 검증
    const tsconfigPath = path.join(this.projectRoot, "tsconfig.json");
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
    if (!tsconfig.compilerOptions?.jsx) {
      throw new Error("FC102: tsconfig.json에 JSX 설정이 없습니다.");
    }

    // package.json 검증
    const packagePath = path.join(this.projectRoot, "package.json");
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    const requiredDeps = [
      "@figma/plugin-typings",
      "react",
      "react-dom",
      "@types/react",
      "@types/react-dom",
      "typescript",
      "esbuild",
    ];

    for (const dep of requiredDeps) {
      if (!pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]) {
        throw new Error(`FC103: ${dep} 의존성이 없습니다.`);
      }
    }
  }

  private async checkBuildEnvironment(): Promise<void> {
    try {
      // TypeScript 컴파일 체크
      await execAsync("npx tsc --noEmit", { cwd: this.projectRoot });
    } catch {
      throw new Error("FB101: TypeScript 컴파일 오류가 있습니다.");
    }

    try {
      // 빌드 테스트
      await execAsync("npm run build", { cwd: this.projectRoot });
    } catch {
      throw new Error("FB102: 빌드에 실패했습니다.");
    }

    // 번들 크기 체크
    const distPath = path.join(this.projectRoot, "dist");
    const files = fs.readdirSync(distPath);
    for (const file of files) {
      const stats = fs.statSync(path.join(distPath, file));
      if (stats.size > 4 * 1024 * 1024) {
        // 4MB 제한
        throw new Error(`FB103: ${file}의 크기가 제한을 초과했습니다.`);
      }
    }
  }

  protected identifyError(error: Error): BaseErrorCase | null {
    const errorPatterns: BaseErrorCase[] = [
      {
        id: "FE101",
        category: "environment",
        severity: "high",
        priority: "high",
        description: "Node.js 버전이 요구사항을 충족하지 않습니다.",
        pattern: /FE101:/,
        fix: async () => {
          console.log("Node.js v18 이상을 설치해주세요: https://nodejs.org/");
        },
      },
      // ... 다른 에러 패턴들
    ];

    return (
      errorPatterns.find((pattern) => pattern.pattern.test(error.message)) ||
      null
    );
  }

  protected async validateFix(error: Error, fix: ErrorFix): Promise<boolean> {
    // 수정 검증 로직
    return true;
  }

  protected generateErrorContext(error: Error): ErrorContext {
    return {
      sourceFile:
        error.stack?.split("\n")[1]?.match(/\((.*):\d+:\d+\)/)?.[1] ||
        undefined,
      stackTrace: error.stack,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };
  }

  public async fixAll(): Promise<void> {
    try {
      // 의존성 설치
      await execAsync("npm install", { cwd: this.projectRoot });

      // 기본 설정 파일 복구
      this.restoreConfigFiles();

      // 타입 정의 설치
      await execAsync("npm install -D @figma/plugin-typings", {
        cwd: this.projectRoot,
      });

      console.log("✅ 모든 수정이 완료되었습니다.");
    } catch (error) {
      await this.handleError(error as Error);
    }
  }

  private restoreConfigFiles(): void {
    // manifest.json 기본값
    const defaultManifest = {
      name: "Figma Plugin",
      id: "000000000000000000",
      api: "1.0.0",
      main: "dist/code.js",
      ui: "dist/ui.html",
    };

    // tsconfig.json 기본값
    const defaultTsconfig = {
      compilerOptions: {
        target: "es6",
        lib: ["es6", "dom"],
        jsx: "react",
        moduleResolution: "node",
        strict: true,
        typeRoots: ["./node_modules/@types", "./node_modules/@figma"],
      },
    };

    fs.writeFileSync(
      path.join(this.projectRoot, "manifest.json"),
      JSON.stringify(defaultManifest, null, 2)
    );

    fs.writeFileSync(
      path.join(this.projectRoot, "tsconfig.json"),
      JSON.stringify(defaultTsconfig, null, 2)
    );
  }
}
