import { BaseErrorHandler } from "../../troubleshooting/scripts/error-handler";

export interface FigmaPluginConfig {
  name: string;
  id: string;
  api: string;
  main: string;
  ui: string;
  editorType: string[];
  networkAccess?: {
    allowedDomains: string[];
    reasoning: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class FigmaSetupValidator extends BaseErrorHandler {
  private config: FigmaPluginConfig;
  private projectRoot: string;

  constructor(config: FigmaPluginConfig, projectRoot: string) {
    super();
    this.config = config;
    this.projectRoot = projectRoot;
  }

  // 환경 검증
  public async validateEnvironment(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Node.js 버전 검증
    const nodeVersion = process.version;
    if (!this.checkVersion(nodeVersion, ">=18.0.0")) {
      result.errors.push("Node.js v18 이상이 필요합니다");
      result.isValid = false;
    }

    return result;
  }

  // 프로젝트 구조 검증
  public async validateStructure(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const requiredFiles = [
      "package.json",
      "manifest.json",
      "tsconfig.json",
      "src/code.ts",
      "src/ui.tsx",
    ];

    for (const file of requiredFiles) {
      if (!(await this.fileExists(file))) {
        result.errors.push(`필수 파일 ${file}이(가) 없습니다`);
        result.isValid = false;
      }
    }

    return result;
  }

  // manifest.json 검증
  public async validateManifest(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    const requiredFields = ["name", "id", "api", "main", "ui"];
    for (const field of requiredFields) {
      if (!this.config[field]) {
        result.errors.push(`manifest.json에 ${field} 필드가 없습니다`);
        result.isValid = false;
      }
    }

    return result;
  }

  // 유틸리티 메서드
  private async fileExists(path: string): Promise<boolean> {
    try {
      await import("fs").then((fs) => fs.promises.access(path));
      return true;
    } catch {
      return false;
    }
  }

  private checkVersion(version: string, requirement: string): boolean {
    // semver 비교 로직 구현
    return true; // 실제 구현 필요
  }

  // 전체 검증 실행
  public async validateAll(): Promise<ValidationResult> {
    const results = await Promise.all([
      this.validateEnvironment(),
      this.validateStructure(),
      this.validateManifest(),
    ]);

    return results.reduce(
      (acc, curr) => ({
        isValid: acc.isValid && curr.isValid,
        errors: [...acc.errors, ...curr.errors],
        warnings: [...acc.warnings, ...curr.warnings],
      }),
      { isValid: true, errors: [], warnings: [] }
    );
  }
}
