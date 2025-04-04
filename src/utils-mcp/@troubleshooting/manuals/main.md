# MCP 시스템 매뉴얼

## 디렉토리 구조
```
scripts/
├─ error-fixer.ts
├─ error-handler.ts
├─ error-logger.ts
├─ error-types.ts
├─ handlers/base-handler.ts
├─ handlers/error-handler.ts
├─ index.ts
├─ mcp-error-integration.ts
├─ troubleshooting-manager.ts
├─ types/error-base.ts
├─ types/error-types.ts
├─ utils/error-fixer.ts
├─ utils/error-logger.ts

manuals/
├─ control.md
├─ instructions.md
├─ main.md
├─ troubleshooting.md


## 최적화 조건
- 스크립트 변경 감지 시간: 100ms
- 파일 안정화 대기 시간: 100ms
- 최적화 상태 체크 주기: 1초
- 무시되는 파일:
-   - node_modules
-   - .git
-   - manuals 디렉토리

## 스크립트 분석
### error-fixer.ts

**클래스:**
- ErrorFixer: 설명 없음

**내보내기:**
- ErrorFixer

**의존성:**
- fs
- child_process
- ../types/error-types

### error-handler.ts

**클래스:**
- ErrorHandler: 설명 없음

**내보내기:**
- ErrorHandler

**의존성:**
- fs
- path
- ../types/error-types

### error-logger.ts

**클래스:**
- ErrorLogger: 설명 없음

**내보내기:**
- ErrorLogger

**의존성:**
- fs
- path
- ../types/error-types

### error-types.ts

**인터페이스:**
- ErrorCase: 설명 없음
- ErrorDocument: 설명 없음

**내보내기:**
- ErrorCategory
- ErrorSeverity
- ErrorPriority
- ErrorCase
- ErrorDocument
- BUILD_PATTERNS
- PLUGIN_PATTERNS
- API_PATTERNS
- UI_PATTERNS

### base-handler.ts

**클래스:**
- BaseErrorHandler: 설명 없음

**의존성:**
- fs
- path

### index.ts

**함수:**
- main: 설명 없음

**의존성:**
- ./troubleshooting-manager
- path
- fs/promises

### mcp-error-integration.ts

**클래스:**
- MCPErrorIntegration: 설명 없음

**인터페이스:**
- MCPConfig: 설명 없음

**내보내기:**
- mcpErrorIntegration

**의존성:**
- ./scripts/error-handler
- fs
- path

### troubleshooting-manager.ts

**클래스:**
- ErrorLogger: 설명 없음
- ErrorFixer: 설명 없음
- ErrorHandler: 설명 없음
- TroubleshootingManager: 설명 없음

**인터페이스:**
- ErrorHistoryItem: 설명 없음
- ErrorCategory: 설명 없음
- ScriptInfo: 설명 없음
- Template: 설명 없음

**내보내기:**
- TroubleshootingManager

**의존성:**
- fs/promises
- path
- events

### error-base.ts

**인터페이스:**
- BaseErrorCase: 설명 없음
- ErrorContext: 설명 없음
- ErrorFix: 설명 없음
- ErrorDocument: 설명 없음
- ErrorStats: 설명 없음

**내보내기:**
- ErrorSeverity
- ErrorPriority
- BaseErrorCase
- ErrorContext
- ErrorFix
- ErrorDocument
- ErrorStats



## 처리된 Command 목록
처리된 Command가 없습니다.