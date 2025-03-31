# {{title}}

## 1. 시스템 개요

{{description}}

## 2. 개발 환경

{{#each environments}}

- {{name}}: {{description}}
  {{/each}}

## 3. 요구사항

{{#each requirements}}

- {{title}}: {{description}}
  {{/each}}

## 4. 설치 단계

{{#each installSteps}}
{{index}}. {{description}}
{{#if command}}

```bash
{{command}}
```

{{/if}}
{{/each}}

## 5. 파일 구조

```
{{projectRoot}}/
{{directoryStructure}}
```

## 6. 개발 환경 설정

{{#each devSetup}}

### {{title}}

{{description}}
{{#if command}}

```bash
{{command}}
```

{{/if}}
{{/each}}

## 7. 빌드 및 배포

{{#each deploySteps}}

### {{title}}

{{description}}
{{#if command}}

```bash
{{command}}
```

{{/if}}
{{/each}}

## 8. 주요 기능

{{#each features}}

### {{title}}

{{description}}
{{#if example}}

```typescript
{
  {
    example;
  }
}
```

{{/if}}
{{/each}}

## 9. API 문서

{{#each apis}}

### {{name}}

- 엔드포인트: `{{endpoint}}`
- 메서드: {{method}}
- 설명: {{description}}
  {{#if parameters}}
- 파라미터:
  {{#each parameters}}
  - {{name}}: {{description}}
    {{/each}}
    {{/if}}
    {{/each}}

## 10. 테스트

{{#each testTypes}}

### {{title}}

{{description}}
{{#if command}}

```bash
{{command}}
```

{{/if}}
{{/each}}

## 11. 테스트 케이스

{{#each testCases}}

### {{title}}

- 목적: {{purpose}}
- 입력: {{input}}
- 예상 결과: {{expectedOutput}}
  {{/each}}

## 12. 문제 해결

{{#each troubleshooting}}

### {{title}}

- 문제: {{problem}}
- 해결: {{solution}}
  {{/each}}

## 13. 디버깅

{{#each debugging}}

### {{title}}

{{description}}
{{#if command}}

```bash
{{command}}
```

{{/if}}
{{/each}}

## 14. 변경 이력

{{#each changes}}

- {{date}}: {{description}}
  {{/each}}

---

_이 문서는 {{generated_date}}에 자동으로 생성되었습니다._
