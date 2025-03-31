# {{systemName}}

## 1. 시스템 개요

### 시스템 목적

{{systemPurpose}}

### 주요 기능

{{#each mainFeatures}}

- {{this}}
  {{/each}}

### Figma MCP Server 기능

{{#each figmaMcpFeatures}}

- {{name}}: {{description}}
  {{/each}}

### 시스템 환경

{{systemEnvironment}}

## 2. 시스템 구조

### 디렉토리 구조

```
{{directoryStructure}}
```

### 주요 파일 설명

{{#each keyFiles}}

- `{{name}}`: {{description}}
  {{/each}}

## 3. 시스템 검증

### 검증 기준

{{#each validationCriteria}}

- {{this}}
  {{/each}}

### 검증 방법

{{#each validationMethods}}

- {{this}}
  {{/each}}

### 검증 결과

{{#each validationResults}}

- {{this}}
  {{/each}}

## 4. 주요 기능

### Figma 통합 기능

#### API 및 인증

- {{integrationFeatures.apiEndpoints}}
- {{integrationFeatures.authentication}}
- {{integrationFeatures.dataSync}}

### Pipeline 및 Workflow

**개발 파이프라인:**

- {{pipeline.design}}
- {{pipeline.development}}
- {{pipeline.automation}}

### 자동화 스크립트

- 컴포넌트 생성: {{automationScripts.componentGeneration}}
- 스타일 업데이트: {{automationScripts.styleUpdates}}
- 에셋 내보내기: {{automationScripts.assetExport}}

### 플러그인 및 확장

- 디자인 시스템: {{plugins.designSystem}}
- 코드 생성: {{plugins.codeGenerator}}
- 에셋 관리: {{plugins.assetManager}}

## 5. 구현 전략

### 시스템의 구조적 측면

- {{implementation.structure}}

### 기능적 측면

- {{implementation.functionality}}

### 코드 품질

- {{implementation.quality}}

### 확장성

- {{implementation.extensibility}}

## 6. 시스템 CLI

### CLI 예제

{{#each cliExamples}}

```bash
{{this}}
```

{{/each}}

## 7. 최근 변경사항

{{#each recentChanges}}

- {{this}}
  {{/each}}

---

_이 문서는 {{timestamp}}에 자동으로 생성되었습니다._
