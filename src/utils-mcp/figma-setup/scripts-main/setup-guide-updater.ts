import fs from "fs";
import path from "path";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

interface ManualSection {
  dependencies: string;
  fileStructure: string;
  validationSteps: string;
  buildCommands: string;
}

export class SetupManualUpdater {
  private manualPath: string;
  private templatePath: string;
  private readonly WATCH_DEBOUNCE = 1000; // 1초
  private updateTimeout: NodeJS.Timeout | null = null;

  constructor(private projectRoot: string) {
    this.manualPath = path.join(
      projectRoot,
      "src/utils-mcp/figma-setup/docs/manuals/figma-setup-manual.md"
    );
    this.templatePath = path.join(
      projectRoot,
      "src/utils-mcp/figma-setup/docs/templates/manual-template.md"
    );
  }

  public async updateManual(): Promise<void> {
    try {
      const packageJson = await this.readPackageJson();
      const manualContent = await this.generateManualContent(packageJson);
      await this.writeManual(manualContent);
      console.log("✅ 매뉴얼 업데이트 완료");
    } catch (error) {
      console.error("❌ 매뉴얼 업데이트 실패:", error);
      throw error;
    }
  }

  private async readPackageJson(): Promise<PackageJson> {
    try {
      const packagePath = path.join(this.projectRoot, "package.json");
      const content = await fs.promises.readFile(packagePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      console.error("❌ package.json 읽기 실패:", error);
      return {};
    }
  }

  private async generateManualContent(
    packageJson: PackageJson
  ): Promise<string> {
    try {
      const template = await fs.promises.readFile(this.templatePath, "utf-8");

      const sections: ManualSection = {
        dependencies: this.generateDependenciesSection(packageJson),
        fileStructure: this.generateFileStructureSection(),
        validationSteps: this.generateValidationStepsSection(),
        buildCommands: this.generateBuildCommandsSection(packageJson),
      };

      return Object.entries(sections).reduce(
        (content, [key, value]) => content.replace(`{{${key}}}`, value),
        template
      );
    } catch (error) {
      console.error("❌ 매뉴얼 콘텐츠 생성 실패:", error);
      throw error;
    }
  }

  private generateDependenciesSection(packageJson: PackageJson): string {
    const { dependencies = {}, devDependencies = {} } = packageJson;

    const formatDependencies = (deps: Record<string, string>): string =>
      Object.entries(deps)
        .map(([key, version]) => `    "${key}": "${version}"`)
        .join(",\n");

    return `
### 1.2 필수 의존성

\`\`\`json
{
  "dependencies": {
${formatDependencies(dependencies)}
  },
  "devDependencies": {
${formatDependencies(devDependencies)}
  }
}
\`\`\`
`;
  }

  private generateFileStructureSection(): string {
    return `
### 1.1 필수 파일 구조

\`\`\`
/
├── package.json           # 의존성 및 스크립트 정의
├── manifest.json         # Figma 플러그인 설정
├── tsconfig.json         # TypeScript 설정
├── .npmrc               # npm 설정
├── src/
│   ├── code.ts          # 플러그인 메인 코드
│   ├── ui/              # UI 컴포넌트
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── utils-mcp/       # 유틸리티 함수
└── dist/                # 빌드 결과물
\`\`\`
`;
  }

  private generateValidationStepsSection(): string {
    return `
### 2.1 환경 검증
- Node.js 버전 확인 (v18 이상)
- npm/yarn 설치 확인
- 글로벌 의존성 확인

### 2.2 프로젝트 구조 검증
- 필수 파일 존재 여부
- 파일 권한 설정
- 디렉토리 구조

### 2.3 설정 파일 검증
- manifest.json 유효성
- tsconfig.json 설정
- 빌드 스크립트 설정
`;
  }

  private generateBuildCommandsSection(packageJson: PackageJson): string {
    const { scripts = {} } = packageJson;
    const getScript = (key: string): string => scripts[key] || `npm run ${key}`;

    return `
### 3.1 전체 점검
\`\`\`bash
${getScript("check:setup")}
\`\`\`

### 3.2 개별 점검
\`\`\`bash
${getScript("check:env")}      # 환경 점검
${getScript("check:struct")}   # 구조 점검
${getScript("check:config")}   # 설정 점검
${getScript("check:build")}    # 빌드 점검
\`\`\`
`;
  }

  private async writeManual(content: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const footer = `\n---\n\n마지막 업데이트: ${timestamp}`;
      await fs.promises.writeFile(this.manualPath, content + footer, "utf-8");
    } catch (error) {
      console.error("❌ 매뉴얼 파일 쓰기 실패:", error);
      throw error;
    }
  }

  public watchForChanges(): void {
    const watchPaths = [
      path.join(this.projectRoot, "package.json"),
      path.join(this.projectRoot, "manifest.json"),
      path.join(this.projectRoot, "tsconfig.json"),
    ];

    console.log("👀 파일 변경 감시 시작...");
    console.log("감시 중인 파일들:");
    watchPaths.forEach((p) => console.log(`- ${path.basename(p)}`));

    watchPaths.forEach((filePath) => {
      fs.watch(filePath, (_eventType, filename) => {
        if (this.updateTimeout) {
          clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(async () => {
          console.log(`📝 변경 감지: ${filename}`);
          try {
            await this.updateManual();
          } catch (error) {
            console.error("❌ 자동 업데이트 실패:", error);
          }
        }, this.WATCH_DEBOUNCE);
      });
    });
  }
}
