# MCP 프로그램 중앙 관제 프로그램

## 개요

본 시스템은 독립 실행형 MCP 시스템으로, 사용자가 지정한 처리 폴더가 어느 위치에 있든지 관계없이, 본 시스템의 메인 프로세스 스크립트를 통해 요청한 폴더를 처리한 결과만을 해당 폴더 내의 지정된 결과 위치에 제공하는 기능을 수행합니다.

## 파일 위치

- **메인 프로세스:** `@core/scripts/`
- **메인 프로세스 템플릿:**
  - `@core/scripts/template/`
- **처리할 데이터:** `요청폴더/`
- **처리 위치:**
  - `요청폴더/`
- **예측 결과:**

  - 프롬프트 :`요청폴더`의 트러블슈팅 가이드를 `@troubleshooting/scripts/`로 작성해줘
  - 처리 :
  - `@core/scripts`는 `@utils-mcp/` 요청된 생성 디렉토리에 아래와 같은 표준화된 디렉토리 구조를 생성합니다:

  - `요청폴더/scripts/`이미 존재한다면 무시하고 없다면 `요청폴더/manuals/instructions.md`의 요청사항을 참고하여 생성합니다.
  - `요청폴더/manuals/control.md`는 `@manuals/scripts`를 실행하여 생성합니다.
  - `요청폴더/manuals/main.md`는 `@manuals/scripts`를 실행하여 생성합니다.
  - `요청폴더/manuals/troubleshooting.md`는 `@troubleshooting/scripts`를 실행하여 생성합니다.

## 주요 기능

- **표준화된 디렉토리 구조 생성**

- **자동 복구 루프 및 최적화 모니터링**
  - 요청된 최적화 모니터링이 정상 상태에 도달할 때까지 자동 복구 루프(automatic recovery loop) 또는 watchdog 프로세스를 통해 지속적으로 실행됩니다.
  - `yes | <command>`, `-y` 또는 `--yes`, `Run Command`, `Accept` 등의 명령어가 자동으로 처리됩니다.
  - 무한 로딩 문제를 해결하기 위해 타임아웃과 자동 종료 기능을 추가합니다.
