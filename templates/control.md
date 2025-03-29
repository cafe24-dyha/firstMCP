# {{title}} 컨트롤 가이드

## 1. 시스템 흐름 및 구성요소

{{#each system_flows}}

### {{name}}

[DEBUG: {{debug_start}}]

#### 실행 단계:

{{#each execution_steps}}

- {{description}} → [DEBUG: {{debug_message}}]
  {{/each}}

#### 관련 구성요소:

{{#each components}}

- **{{name}}**
  - **용도:** {{purpose}}
  - **위치:** `{{location}}`
  - **디버깅 정보:** {{debug_info}}
    {{/each}}

[DEBUG: {{debug_end}}]

{{/each}}

## 2. 시나리오별 예제

### 2.1 정상 시나리오

{{#each normal_scenarios}}

#### {{name}}

```
{{log_example}}
```

{{description}}

{{/each}}

### 2.2 오류 시나리오

{{#each error_scenarios}}

#### {{name}}

```
{{log_example}}
```

{{description}}
{{#if recovery_steps}}
복구 단계:
{{#each recovery_steps}}

- {{this}}
  {{/each}}
  {{/if}}

{{/each}}

## 3. 로그 정보 및 디버깅

### 3.1 로그 파일 구조

{{#each log_files}}

- **{{name}}**
  - 파일: `{{path}}`
  - 레벨: {{levels}}
  - 포맷: `{{format}}`
    {{/each}}

### 3.2 이벤트 처리 시스템

#### 이벤트 큐 관리

{{#with event_queue}}

- **큐 상태**

  - 현재 크기: {{current_size}}
  - 최대 용량: {{max_capacity}}
  - 처리 중: {{processing}}
  - 대기 중: {{waiting}}

- **성능 지표**
  - 평균 처리 시간: {{avg_processing_time}}
  - 초당 처리량: {{throughput}}
  - 오류율: {{error_rate}}
    {{/with}}

#### 이벤트 유형별 처리

{{#each event_handlers}}

- **{{type}}**
  - 우선순위: {{priority}}
  - 재시도 정책: {{retry_policy}}
  - 타임아웃: {{timeout}}
  - 에러 처리: {{error_handling}}
    {{/each}}

### 3.3 동기화 메커니즘

#### 리소스 잠금

{{#with resource_locks}}

- **파일 잠금**
  - 타임아웃: {{file_lock_timeout}}
  - 재시도 간격: {{retry_interval}}
- **프로세스 동기화**
  - 세마포어 제한: {{semaphore_limit}}
  - 뮤텍스 타임아웃: {{mutex_timeout}}
    {{/with}}

#### 데이터 정합성

{{#with data_consistency}}

- **트랜잭션 관리**
  - 격리 수준: {{isolation_level}}
  - 롤백 정책: {{rollback_policy}}
- **백업 전략**
  - 주기: {{backup_interval}}
  - 보관 기간: {{retention_period}}
    {{/with}}

### 3.4 문제 해결 가이드

#### 로그 분석 절차

{{#each log_analysis}}

1. **{{step}}**
   ```bash
   {{command}}
   ```
   {{description}}
   {{/each}}

#### 일반적인 문제 해결

{{#each common_issues}}

- **문제:** {{issue}}
  - **증상:** {{symptoms}}
  - **원인:** {{causes}}
  - **해결방법:**
    ```bash
    {{solution_commands}}
    ```
  - **예방책:** {{prevention}}
    {{/each}}

#### 긴급 복구 절차

{{#each emergency_procedures}}

1. **{{step}}**
   ```bash
   {{command}}
   ```
   {{description}}
   {{#if warning}}
   > ⚠️ {{warning}} > {{/if}} > {{/each}}

## 4. 시스템 상태 및 모니터링

### 4.1 현재 상태

{{#with system_status}}

- **런타임 상태:** {{runtime_status}}
- **메모리 사용량:** {{memory_usage}}
- **CPU 사용량:** {{cpu_usage}}
- **에러율:** {{error_rate}}
  {{/with}}

### 4.2 모니터링 명령어

```bash
{{#each monitoring_commands}}
# {{description}}
{{command}}

{{/each}}
```

## 5. CI/CD 통합

### 5.1 배포 파이프라인

```bash
{{#each deployment_pipeline}}
# {{description}}
{{command}}

{{/each}}
```

### 5.2 자동화된 테스트

```bash
{{#each automated_tests}}
# {{description}}
{{command}}

{{/each}}
```

---

_이 문서는 {{generated_date}}에 자동으로 생성되었습니다._
_마지막 업데이트: {{last_updated}}_
