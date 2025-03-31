import * as fs from 'fs-extra';
import * as path from 'path';
import Handlebars from 'handlebars';
import logger from './logger';
import { ManualTemplateData, HandlebarsTemplateDelegate, ChangeRecord, BackupFile } from './types';

/**
 * template-manager.ts
 *
 * 템플릿 관리를 담당하는 모듈입니다.
 * - 템플릿 초기화 및 백업
 * - 파이프라인/워크플로우 템플릿 관리
 * - 템플릿 데이터 변환
 */

export interface TemplateManagerOptions {
  templateDir: string;
  backupDir: string;
  maxBackups: number;
  debug?: boolean;
}

export interface PipelineTemplate {
  name: string;
  steps: {
    description: string;
    sourcePath: string;
    targetPath: string;
  }[];
}

export interface TemplateManagerConfig {
  projectRoot: string;
  templateDir: string;
  backupDir: string;
  maxBackups: number;
  debug?: boolean;
}

export interface SystemStatus {
  lastRun: string;
  status: string;
  outputPath: string;
}

export class TemplateManager {
  private config: TemplateManagerConfig;
  private projectRoot: string;

  constructor(config: TemplateManagerConfig, options: { projectRoot: string }) {
    this.config = config;
    this.projectRoot = options.projectRoot;
  }

  public async initialize(): Promise<void> {
    await fs.ensureDir(this.config.templateDir);
    await fs.ensureDir(this.config.backupDir);
  }

  public getTemplateDir(): string {
    return this.config.templateDir;
  }

  public getProjectRoot(): string {
    return this.projectRoot;
  }

  public getBackupDir(): string {
    return this.config.backupDir;
  }

  public async getTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    const templatePath = path.join(this.config.templateDir, templateName);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
  }

  public async createBackup(fileName: string, content: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const backupPath = path.join(this.config.backupDir, `${fileName}-${timestamp}`);
    await fs.writeFile(backupPath, content, 'utf-8');
  }

  public async createPipelineTemplate(pipeline: PipelineTemplate): Promise<void> {
    try {
      const templatePath = path.join(this.config.templateDir, 'lib', `${pipeline.name}.hbs`);
      const content = this.generatePipelineContent(pipeline);
      await fs.writeFile(templatePath, content, 'utf-8');
      logger.info(`파이프라인 템플릿 생성 완료: ${pipeline.name}`);
    } catch (error) {
      logger.error(`파이프라인 템플릿 생성 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  private generatePipelineContent(pipeline: PipelineTemplate): string {
    return `
{{!-- ${pipeline.name} 파이프라인 템플릿 --}}
# ${pipeline.name}

## 파이프라인 단계
${pipeline.steps
  .map(
    (step, index) => `
### ${index + 1}. ${step.description}
- 소스 경로: \`${step.sourcePath}\`
- 대상 경로: \`${step.targetPath}\`
`
  )
  .join('\n')}

## 실행 로그
{{#each logs}}
- {{timestamp}} [{{level}}] {{message}}
{{/each}}
`;
  }

  public async backupTemplate(templateName: string): Promise<void> {
    try {
      const sourcePath = path.join(this.config.templateDir, templateName);
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const backupPath = path.join(
        this.config.backupDir,
        `${path.basename(templateName, '.hbs')}-${timestamp}.hbs`
      );

      await fs.copy(sourcePath, backupPath);
      await this.enforceBackupLimit();
      logger.info(`템플릿 백업 완료: ${backupPath}`);
    } catch (error) {
      logger.error(`템플릿 백업 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  private async enforceBackupLimit(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.backupDir);
      const backupFiles: BackupFile[] = [];

      for (const file of files.filter((f) => f.endsWith('.hbs'))) {
        const filePath = path.join(this.config.backupDir, file);
        const isFile = await fs.pathExists(filePath);
        if (isFile) {
          backupFiles.push({
            name: file,
            path: filePath,
            mtime: new Date().getTime(),
          });
        }
      }

      backupFiles.sort((a, b) => b.mtime - a.mtime);

      if (backupFiles.length > this.config.maxBackups) {
        const filesToDelete = backupFiles.slice(this.config.maxBackups);
        for (const file of filesToDelete) {
          await fs.remove(file.path);
          logger.info(`오래된 템플릿 백업 삭제: ${file.name}`);
        }
      }
    } catch (error) {
      logger.error(`템플릿 백업 정리 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async restoreTemplate(backupName: string): Promise<void> {
    try {
      const backupPath = path.join(this.config.backupDir, backupName);
      const originalName = backupName.split('-')[0] + '.hbs';
      const targetPath = path.join(this.config.templateDir, originalName);

      await fs.copy(backupPath, targetPath);
      logger.info(`템플릿 복원 완료: ${targetPath}`);
    } catch (error) {
      logger.error(`템플릿 복원 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async recordChange(change: ChangeRecord): Promise<void> {
    try {
      const changesPath = path.join(this.projectRoot, 'manuals', 'changes.json');
      let changes: ChangeRecord[] = [];

      if (await fs.pathExists(changesPath)) {
        const content = await fs.readFile(changesPath, 'utf-8');
        changes = JSON.parse(content);
      }

      changes.push(change);
      await fs.ensureDir(path.dirname(changesPath));
      await fs.writeFile(changesPath, JSON.stringify(changes, null, 2), 'utf-8');
      logger.info(`변경 사항 기록 완료: ${change.description}`);
    } catch (error) {
      logger.error(`변경 사항 기록 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async updateStatus(status: SystemStatus): Promise<void> {
    try {
      const statusPath = path.join(this.projectRoot, 'manuals', 'status.json');
      await fs.ensureDir(path.dirname(statusPath));
      await fs.writeFile(statusPath, JSON.stringify(status, null, 2), 'utf-8');
      logger.info(`시스템 상태 업데이트 완료: ${status.status}`);
    } catch (error) {
      logger.error(`시스템 상태 업데이트 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async generateChangelog(): Promise<string> {
    try {
      const changesPath = path.join(this.config.templateDir, 'changes.json');
      if (!(await fs.pathExists(changesPath))) {
        return '변경 이력이 없습니다.';
      }

      const content = await fs.readFile(changesPath, 'utf-8');
      const changes: ChangeRecord[] = JSON.parse(content);

      return changes
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((change) => {
          let log = `## ${new Date(change.timestamp).toLocaleString()}\n`;
          log += `- 유형: ${change.type}\n`;
          log += `- 설명: ${change.description}\n`;
          log += `- 상태: ${change.status}\n`;
          if (change.author) log += `- 작성자: ${change.author}\n`;
          if (change.scope) log += `- 범위: ${change.scope}\n`;
          if (change.relatedFiles) {
            log += '- 관련 파일:\n';
            change.relatedFiles.forEach((file) => {
              log += `  - ${file}\n`;
            });
          }
          return log;
        })
        .join('\n');
    } catch (error) {
      logger.error(`변경 로그 생성 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async processTemplate(templatePath: string, data: ManualTemplateData): Promise<string> {
    try {
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(templateContent);
      let result = template(data);

      // HTML 엔티티 디코딩
      result = result
        .replace(/&#x60;/g, '`')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&#x3D;/g, '=');

      // 연속된 빈 줄 제거
      result = result.replace(/\n{3,}/g, '\n\n');

      // 불필요한 공백 제거
      result = result
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .replace(/\n\s*\n/g, '\n\n');

      logger.info(`템플릿 처리 완료: ${path.basename(templatePath)}`);
      return result;
    } catch (error) {
      logger.error(`템플릿 처리 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  private async analyzeScriptsMain(): Promise<{
    scripts: { name: string; description: string; path: string }[];
    utils: { name: string; description: string; path: string }[];
    configs: { name: string; content: Record<string, unknown> }[];
  }> {
    const scriptsDir = this.projectRoot;
    const result = {
      scripts: [] as { name: string; description: string; path: string }[],
      utils: [] as { name: string; description: string; path: string }[],
      configs: [] as { name: string; content: Record<string, unknown> }[],
    };

    try {
      const files = await fs.readdir(scriptsDir);

      for (const file of files) {
        const fullPath = path.join(scriptsDir, file);

        if (await fs.pathExists(fullPath)) {
          if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            const content = await fs.readFile(fullPath, 'utf-8');
            const description = this.extractFileDescription(content);

            if (file.includes('util') || file === 'logger.ts' || file === 'types.ts') {
              result.utils.push({
                name: file,
                description,
                path: fullPath,
              });
            } else {
              result.scripts.push({
                name: file,
                description,
                path: fullPath,
              });
            }
          } else if (file.endsWith('.json')) {
            const content = await fs.readFile(fullPath, 'utf-8');
            result.configs.push({
              name: file,
              content: JSON.parse(content) as Record<string, unknown>,
            });
          }
        }
      }
    } catch (error) {
      logger.error(`스크립트 분석 실패: ${(error as Error).message}`);
    }

    return result;
  }

  private extractFileDescription(content: string): string {
    const lines = content.split('\n');
    let description = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('/*') || line.startsWith('/**') || line.startsWith('//')) {
        const comment = line.replace(/^\/\*+|\*+\/|\/\//, '').trim();
        if (comment && !comment.includes('@') && !comment.includes('TODO')) {
          description = comment;
          break;
        }
      } else if (line.length > 0 && !line.startsWith('import')) {
        break;
      }
    }

    return description;
  }

  private async getDirectoryStructure(dir: string): Promise<string> {
    try {
      const items = await fs.readdir(dir);
      let structure = '';

      for (const item of items) {
        const fullPath = path.join(dir, item);
        try {
          await fs.readdir(fullPath);
          structure += `\n├── ${item}/`;
          const subItems = await this.getDirectoryStructure(fullPath);
          structure += subItems
            .split('\n')
            .map((line) => `\n│   ${line}`)
            .join('');
        } catch (error) {
          structure += `\n├── ${item}`;
        }
      }

      return structure;
    } catch (error) {
      logger.error(`디렉토리 구조 분석 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async getDefaultTemplateData(): Promise<ManualTemplateData> {
    const projectPath = this.projectRoot;

    const figmaIntegration = [
      {
        category: '디자인 시스템',
        features: [
          { name: 'API 엔드포인트', description: 'Figma API 엔드포인트 연동' },
          { name: '인증', description: '인증 및 권한 관리' },
          { name: '동기화', description: '데이터 동기화 프로세스' },
        ],
      },
    ];

    const automationScripts = {
      componentGeneration: '컴포넌트 자동 생성',
      styleUpdates: '스타일 업데이트 자동화',
      assetExport: '에셋 내보내기 자동화',
    };

    const plugins = {
      designSystem: '디자인 시스템 플러그인',
      codeGenerator: '코드 생성 플러그인',
      assetManager: '에셋 관리 플러그인',
    };

    const directoryStructure = await this.getDirectoryStructure(projectPath);
    const keyFiles = await this.analyzeKeyFiles(projectPath);

    return {
      project: {
        name: path.basename(projectPath),
        path: projectPath,
        manualPath: path.join(projectPath, 'manuals'),
      },
      projectRoot: projectPath,
      systemName: 'Figma MCP Server',
      systemPurpose: 'Figma 디자인 시스템과 개발 환경의 통합 및 자동화',
      systemEnvironment: '개발 및 디자인 환경',
      directoryStructure,
      keyFiles,
      mainFeatures: ['Figma API 통합', '컴포넌트 동기화', '디자인 토큰 관리'],
      figmaMcpFeatures: [
        { name: 'API 통합', description: 'Figma API를 통한 디자인 시스템 자동화' },
        { name: '컴포넌트 동기화', description: 'Figma 컴포넌트와 코드베이스 간의 자동 동기화' },
        { name: '디자인 토큰', description: '디자인 토큰의 자동 추출 및 관리' },
      ],
      figmaIntegration,
      integrationFeatures: {
        apiEndpoints: 'Figma API 엔드포인트 연동',
        authentication: '인증 및 권한 관리',
        dataSync: '데이터 동기화 프로세스',
      },
      pipeline: {
        design: '디자인 시스템 구축',
        development: '개발 환경 통합',
        automation: '자동화 프로세스 구현',
      },
      automationScripts,
      plugins,
      implementation: {
        structure: '모듈화된 구조',
        functionality: 'API 기반 기능 구현',
        quality: '코드 품질 관리',
        extensibility: '플러그인 확장성',
      },
      changes: [{ date: new Date().toISOString(), description: '초기 시스템 설정' }],
      validation: {
        criteria: ['Figma API 연동 검증', '플러그인 동작 검증', '자동화 스크립트 검증'],
        methods: ['API 엔드포인트 테스트', '플러그인 기능 테스트', '스크립트 실행 테스트'],
      },
      validationCriteria: ['Figma API 연동 검증', '플러그인 동작 검증', '자동화 스크립트 검증'],
      validationMethods: ['API 엔드포인트 테스트', '플러그인 기능 테스트', '스크립트 실행 테스트'],
      validationResults: ['API 연동 성공', '플러그인 정상 동작', '스크립트 실행 완료'],
      cliExamples: [
        'npx ts-node index.ts --plugin=design-system',
        'npx ts-node index.ts --export=assets',
      ],
      recentChanges: ['플러그인 시스템 업데이트', 'API 엔드포인트 추가', '자동화 스크립트 개선'],
      version: '1.0.0',
      description: 'Figma MCP Server 시스템',
      author: process.env.USER || 'unknown',
      timestamp: new Date().toISOString(),
    };
  }

  private async analyzeKeyFiles(
    _projectPath: string
  ): Promise<Array<{ name: string; description: string }>> {
    return [
      { name: 'index.ts', description: '메인 엔트리 포인트' },
      { name: 'template-manager.ts', description: '템플릿 관리 모듈' },
      { name: 'manual-generator.ts', description: '매뉴얼 생성 모듈' },
    ];
  }

  private async getSystemEnvironment(): Promise<string> {
    try {
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      return `Node.js 환경\nTypeScript ${packageJson.devDependencies?.typescript || '최신 버전'}\n`;
    } catch (error) {
      return '시스템 환경 정보를 가져올 수 없습니다.';
    }
  }
}
