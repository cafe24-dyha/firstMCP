# MCP 자율 최적화 매뉴얼 생성 시스템

## 개요

MCP 자율 최적화 매뉴얼 생성 시스템은 템플릿 기반의 매뉴얼을 자동으로 생성하고 관리하는 도구입니다.

## 주요 기능

- 컨텍스트 기반 변수 처리
- 템플릿 검증 및 백업
- 잠금 메커니즘으로 동시 수정 방지
- 상세한 로깅 시스템
- 타입 안전성 보장

## 설치

```bash
npm install
```

## 사용 방법

### 매뉴얼 생성

```bash
npm run build
npm run deploy
```

### 테스트 실행

```bash
npm test
```

### 코드 품질 검사

```bash
npm run lint
npm run format
```

## 디렉토리 구조

```
src/
  ├── utils-mcp/
  │   └── @manuals/
  │       └── scripts-main/
  │           ├── templates/
  │           │   ├── main.md
  │           │   ├── control.md
  │           │   ├── backups/
  │           │   └── lib/
  │           ├── tests/
  │           │   ├── template-manager.test.ts
  │           │   └── manual-generator.test.ts
  │           ├── template-manager.ts
  │           ├── manual-generator.ts
  │           └── types.ts
  └── index.ts
```

## API 문서

### TemplateManager

템플릿 파일을 관리하고 처리하는 클래스입니다.

#### 주요 메서드

- `loadTemplates()`: 템플릿 파일을 로드합니다.
- `validateTemplate(templateName: string)`: 템플릿을 검증합니다.
- `backupTemplate(templateName: string)`: 템플릿을 백업합니다.
- `processTemplateWithContext(template: string, context: TemplateContext)`: 컨텍스트를 사용하여 템플릿을 처리합니다.
- `lockTemplate(templateName: string)`: 템플릿을 잠금 처리합니다.
- `unlockTemplate(templateName: string)`: 템플릿의 잠금을 해제합니다.

### ManualGenerator

매뉴얼 생성을 담당하는 클래스입니다.

#### 주요 메서드

- `generateManuals(context: TemplateContext)`: 매뉴얼을 생성합니다.
- `getLogs()`: 로그 목록을 반환합니다.
- `clearLogs()`: 로그를 초기화합니다.

## 개발 가이드

### 코드 스타일

- TypeScript의 strict 모드 사용
- ESLint와 Prettier를 통한 코드 포맷팅
- 테스트 커버리지 유지

### 테스트

- Jest를 사용한 단위 테스트
- 테스트 커버리지 리포트 생성
- 자동화된 테스트 실행

### CI/CD

- GitHub Actions를 통한 자동화된 빌드 및 테스트
- 코드 품질 검사
- 자동 배포

## 라이선스

MIT
