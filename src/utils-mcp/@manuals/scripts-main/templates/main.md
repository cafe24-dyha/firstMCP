# {{systemName}}

## 1. 시스템 개요

### 시스템 목적

{{systemPurpose}}

### 시스템 환경

{{#each environments}}

- {{name}}: {{description}}
  {{/each}}

## 2. 시스템 구조

### 디렉토리 구조

```
{{projectRoot}}/
{{directoryStructure}}
```

### 주요 파일 설명

{{#each fileDescriptions}}

- `{{path}}`: {{description}}
  {{/each}}

## 3. 시스템 검증

### 검증 기준

{{#each validationCriteria}}

- {{title}}: {{description}}
  {{/each}}

### 검증 방법

{{#each validationMethods}}

- {{title}}: {{description}}
  {{/each}}

### 검증 결과

{{#each validationResults}}

- {{title}}: {{description}}
  {{/each}}

## 4. 주요 기능

### Pipeline 및 Workflow

{{#each pipelines}}
{{index}}. {{name}}
{{#each steps}}

- {{this}}
  {{/each}}
  {{/each}}

### 기능 목록

{{#each features}}
{{index}}. {{name}}
{{#each details}}

- {{this}}
  {{/each}}
  {{/each}}

### 백업 관리와 로그·매뉴얼 동기화

{{#each backupManagement}}

- {{title}}: {{description}}
  {{/each}}

## 5. 구현 전략

### 시스템의 구조적 측면

{{#each structuralAspects}}

- {{title}}: {{description}}
  {{/each}}

### 기능적 측면

{{#each functionalAspects}}

- {{title}}: {{description}}
  {{/each}}

### 코드 품질

{{#each codeQuality}}

- {{title}}: {{description}}
  {{/each}}

### 확장성

{{#each extensibility}}

- {{title}}: {{description}}
  {{/each}}

## 6. 시스템 CLI

### 기본 실행

```bash
{{basicCommand}}
```

### 경로 지정 실행

```bash
{{pathCommand}}
```

## 7. 최근 변경사항

{{#each changes}}

- {{date}}: {{description}}
  {{/each}}

---

_이 문서는 {{generated_date}}에 자동으로 생성되었습니다._
