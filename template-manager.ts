import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import logger from './logger';
import { ManualTemplateData } from './types.d';

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
}

export interface ChangeRecord {
  type: string;
  description: string;
  timestamp: string;
  status: string;
  author?: string;
  scope?: string;
  relatedFiles?: string[];
}

export interface SystemStatus {
  lastRun: string;
  status: string;
  outputPath: string;
}

export class TemplateManager {
  private templateDir: string;
  private backupDir: string;
  private maxBackups: number;
  private debug: boolean;
  private config: TemplateManagerConfig;

  constructor(options: TemplateManagerOptions, config: TemplateManagerConfig) {
    this.templateDir = options.templateDir;
    this.backupDir = options.backupDir;
    this.maxBackups = options.maxBackups;
    this.debug = options.debug || false;
    this.config = config;
    this.initializeDirectories();
  }

  private initializeDirectories(): void {
    try {
      fs.ensureDirSync(this.templateDir);
      fs.ensureDirSync(this.backupDir);
      fs.ensureDirSync(path.join(this.templateDir, 'lib'));
      logger.info('템플릿 디렉토리 초기화 완료');
    } catch (error) {
      logger.error(`템플릿 디렉토리 초기화 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async createPipelineTemplate(pipeline: PipelineTemplate): Promise<void> {
    try {
      const templatePath = path.join(this.templateDir, 'lib', `${pipeline.name}.hbs`);
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
      const sourcePath = path.join(this.templateDir, templateName);
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const backupPath = path.join(
        this.backupDir,
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
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files
        .filter((file) => file.endsWith('.hbs'))
        .map((file) => ({
          name: file,
          path: path.join(this.backupDir, file),
          mtime: fs.statSync(path.join(this.backupDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.mtime - a.mtime);

      if (backupFiles.length > this.maxBackups) {
        const filesToDelete = backupFiles.slice(this.maxBackups);
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
      const backupPath = path.join(this.backupDir, backupName);
      const originalName = backupName.split('-')[0] + '.hbs';
      const targetPath = path.join(this.templateDir, originalName);

      await fs.copy(backupPath, targetPath);
      logger.info(`템플릿 복원 완료: ${targetPath}`);
    } catch (error) {
      logger.error(`템플릿 복원 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async recordChange(change: ChangeRecord): Promise<void> {
    try {
      const changesPath = path.join(this.templateDir, 'changes.json');
      let changes: ChangeRecord[] = [];

      if (await fs.pathExists(changesPath)) {
        const content = await fs.readFile(changesPath, 'utf-8');
        changes = JSON.parse(content);
      }

      changes.push(change);
      await fs.writeFile(changesPath, JSON.stringify(changes, null, 2), 'utf-8');
      logger.info(`변경 사항 기록 완료: ${change.description}`);
    } catch (error) {
      logger.error(`변경 사항 기록 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async updateStatus(status: SystemStatus): Promise<void> {
    try {
      const statusPath = path.join(this.templateDir, 'status.json');
      await fs.writeFile(statusPath, JSON.stringify(status, null, 2), 'utf-8');
      logger.info(`시스템 상태 업데이트 완료: ${status.status}`);
    } catch (error) {
      logger.error(`시스템 상태 업데이트 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public async generateChangelog(): Promise<string> {
    try {
      const changesPath = path.join(this.templateDir, 'changes.json');
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
        .replace(/&amp;/g, '&');

      // 연속된 빈 줄 제거
      result = result.replace(/\n{3,}/g, '\n\n');

      logger.info(`템플릿 처리 완료: ${path.basename(templatePath)}`);
      return result;
    } catch (error) {
      logger.error(`템플릿 처리 실패: ${(error as Error).message}`);
      throw error;
    }
  }

  public getDefaultTemplateData(): ManualTemplateData {
    const timestamp = new Date().toISOString();
    return {
      systemName: 'MCP 자율 최적화 매뉴얼 생성 시스템',
      systemPurpose: '웹 기반 시스템의 매뉴얼을 자동으로 생성하고 관리하는 도구',
      environments: [
        {
          name: 'Node.js',
          description: 'v20.11.1 이상 - 서버 사이드 JavaScript 런타임',
        },
        {
          name: 'TypeScript',
          description: 'v5.0.0 이상 - 정적 타입 지원 JavaScript',
        },
        {
          name: 'Handlebars',
          description: '템플릿 엔진 - 동적 문서 생성',
        },
        {
          name: 'Winston',
          description: '로깅 시스템 - 상세 로그 관리',
        },
      ],
      projectRoot: this.config.projectRoot,
      directoryStructure: `├── @manuals/
│   ├── scripts-main/      # 메인 스크립트 디렉토리
│   │   ├── templates/     # 템플릿 파일 디렉토리
│   │   │   ├── lib/      # 공통 템플릿 라이브러리
│   │   │   │   ├── changes.hbs
│   │   │   │   ├── features.hbs
│   │   │   │   └── pipeline.hbs
│   │   │   ├── control.md
│   │   │   ├── main.md
│   │   │   └── manual.hbs
│   │   ├── src/          # 소스 코드 디렉토리
│   │   │   ├── core/     # 핵심 기능 구현
│   │   │   │   ├── manual-generator.ts
│   │   │   │   ├── template-manager.ts
│   │   │   │   └── backup-manager.ts
│   │   │   ├── utils/    # 유틸리티 기능
│   │   │   │   ├── logger.ts
│   │   │   │   └── types.ts
│   │   │   └── index.ts  # 진입점
│   │   ├── package.json  # 프로젝트 설정
│   │   └── tsconfig.json # TypeScript 설정
│   ├── docs/             # 문서 디렉토리
│   └── manuals/          # 생성된 매뉴얼 저장
└── backups/              # 백업 디렉토리`,
      fileDescriptions: [
        {
          path: 'src/core/manual-generator.ts',
          description: '매뉴얼 생성 핵심 로직 구현',
        },
        {
          path: 'src/core/template-manager.ts',
          description: '템플릿 관리 및 데이터 처리',
        },
        {
          path: 'src/core/backup-manager.ts',
          description: '백업 생성 및 관리',
        },
        {
          path: 'src/utils/logger.ts',
          description: '시스템 로깅 유틸리티',
        },
        {
          path: 'src/utils/types.ts',
          description: '시스템 타입 정의',
        },
        {
          path: 'src/index.ts',
          description: '시스템 진입점 및 CLI 인터페이스',
        },
      ],
      validationCriteria: [
        {
          title: 'Directory-Agnostic 실행',
          description: '디렉토리 구조에 독립적인 실행 지원',
        },
        {
          title: 'Context-Driven Output',
          description: '컨텍스트 기반의 동적 출력 생성',
        },
        {
          title: '자동화된 백업 관리',
          description: '버전 관리와 복원 기능 제공',
        },
        {
          title: '상세한 로깅',
          description: '시스템 동작 추적 및 디버깅 지원',
        },
      ],
      validationMethods: [
        {
          title: '단위 테스트',
          description: '각 모듈의 독립적인 기능 검증',
        },
        {
          title: '통합 테스트',
          description: '모듈 간 상호작용 및 데이터 흐름 검증',
        },
        {
          title: '시나리오 테스트',
          description: '실제 사용 사례 기반 검증',
        },
        {
          title: '성능 테스트',
          description: '대용량 데이터 처리 및 동시성 검증',
        },
      ],
      validationResults: [
        {
          title: '디렉토리 독립성',
          description: '다양한 경로에서 정상 동작 확인',
        },
        {
          title: '데이터 처리',
          description: '동적 데이터 주입 및 변환 정상',
        },
        {
          title: '백업 관리',
          description: '자동 백업 및 복원 기능 정상',
        },
        {
          title: '로깅 시스템',
          description: '상세 로그 기록 및 조회 정상',
        },
      ],
      pipelines: [
        {
          index: 1,
          name: '템플릿 생성 파이프라인',
          steps: [
            '요구사항 분석 및 검토',
            '시스템 구축 및 설정',
            '템플릿 파일 생성 및 관리',
            '백업 자동화 구현',
          ],
        },
        {
          index: 2,
          name: '매뉴얼 생성 파이프라인',
          steps: [
            '시스템 정보 수집',
            '템플릿 데이터 주입',
            '매뉴얼 파일 생성',
            '백업 및 버전 관리',
          ],
        },
      ],
      features: [
        {
          index: 1,
          name: '매뉴얼 템플릿 관리',
          details: ['템플릿 초기화 및 구성', '데이터 변환 및 검증', '동적 데이터 주입'],
        },
        {
          index: 2,
          name: '자동화된 매뉴얼 생성',
          details: ['컨텍스트 기반 생성', '환경 변수 처리', '경로 동적 해석'],
        },
        {
          index: 3,
          name: '백업 및 로그 관리',
          details: ['자동 백업 생성', '버전 관리', '복원 기능', '상세 로깅'],
        },
      ],
      backupManagement: [
        {
          title: '백업 정책',
          description: '최대 10개 버전 유지',
        },
        {
          title: '백업 위치',
          description: '`backups/` 디렉토리',
        },
        {
          title: '백업 주기',
          description: '매뉴얼 생성 시 자동 백업',
        },
        {
          title: '로그 관리',
          description: 'Winston 로거를 통한 상세 로깅',
        },
      ],
      structuralAspects: [
        {
          title: '모듈화',
          description: '기능별 독립적인 모듈 구성',
        },
        {
          title: '확장성',
          description: '플러그인 방식의 기능 확장 지원',
        },
        {
          title: '유연성',
          description: '다양한 환경에서의 실행 지원',
        },
        {
          title: '재사용성',
          description: '공통 컴포넌트 추상화',
        },
      ],
      functionalAspects: [
        {
          title: '자동화',
          description: '반복 작업의 자동화',
        },
        {
          title: '검증',
          description: '데이터 및 출력 검증',
        },
        {
          title: '오류 처리',
          description: '상세한 오류 메시지 제공',
        },
        {
          title: '로깅',
          description: '시스템 동작 추적',
        },
      ],
      codeQuality: [
        {
          title: 'TypeScript',
          description: '정적 타입 검사',
        },
        {
          title: 'ESLint',
          description: '코드 스타일 통일',
        },
        {
          title: 'Jest',
          description: '단위 테스트 및 통합 테스트',
        },
        {
          title: 'JSDoc',
          description: '코드 문서화',
        },
      ],
      extensibility: [
        {
          title: '템플릿 확장',
          description: '새로운 템플릿 추가 용이',
        },
        {
          title: '기능 확장',
          description: '플러그인 시스템 지원',
        },
        {
          title: '출력 형식',
          description: '다양한 출력 형식 지원',
        },
        {
          title: '통합',
          description: '외부 시스템과의 통합 지원',
        },
      ],
      basicCommand: 'npx ts-node index.ts',
      pathCommand:
        'npx ts-node index.ts --path <프로젝트경로> --templates <템플릿경로> --output <출력경로>',
      changes: [
        {
          date: timestamp.split('T')[0],
          description: '시스템 초기 구현',
        },
        {
          date: timestamp.split('T')[0],
          description: '백업 관리 기능 추가',
        },
        {
          date: timestamp.split('T')[0],
          description: '로깅 시스템 개선',
        },
      ],
      generated_date: timestamp,
    };
  }

  public getTemplateDir(): string {
    return this.templateDir;
  }
}
