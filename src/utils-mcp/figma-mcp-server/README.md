# Figma MCP Server

## 사용 범위

### 1. 시스템 개요

- Figma API와 연동하여 디자인 시스템을 자동화하는 MCP 서버
- AI 도구 및 LLM과 연동하여 Figma 디자인 작업 지원

### 2. 주요 기능

- 디자인 데이터 추출: 컴포넌트, 스타일, 텍스트 추출
- 디자인 시스템 분석: 일관성 및 패턴 분석
- UI 콘텐츠 관리: UI 복사본 추출 및 구성
- 개발 인수인계: 개발자를 위한 문서 생성
- AI 통합: Claude, Cursor 등 MCP 호환 클라이언트 연동

### 3. 시작하기

```bash
# 1. 저장소 복제
git clone https://github.com/yourusername/figma-mcp-server.git
cd figma-mcp-server

# 2. 의존성 설치
npm install

# 3. 환경 설정
# .env 파일 생성:
FIGMA_API_TOKEN=your_figma_personal_access_token
API_KEY=your_secure_api_key
TRANSPORT_TYPE=stdio

# 4. 빌드 및 실행
npm run build
npm start
```

### 4. 클라이언트 연동

#### Claude for Desktop

- 설정 파일 위치:
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

#### Cursor

- 전역 설정: `~/Library/Application Support/Cursor/mcp.json`
- 프로젝트 설정: `.cursor/mcp.json`

### 5. 사용 가능한 도구

| 도구             | 설명                      |
| ---------------- | ------------------------- |
| `get-file-info`  | Figma 파일 기본 정보 조회 |
| `get-nodes`      | 특정 노드 조회            |
| `get-components` | 컴포넌트 정보 조회        |
| `get-styles`     | 스타일 정보 조회          |
| `get-comments`   | 코멘트 조회               |
| `search-file`    | 파일 내 요소 검색         |
| `extract-text`   | 텍스트 요소 추출          |

### 6. 사용 가능한 프롬프트

- `analyze-design-system`: 디자인 시스템 분석
- `extract-ui-copy`: UI 복사본 추출
- `generate-dev-handoff`: 개발 인수인계 문서 생성

### 7. 환경 변수

| 변수              | 설명                      | 기본값  |
| ----------------- | ------------------------- | ------- |
| `FIGMA_API_TOKEN` | Figma API 토큰            | (필수)  |
| `API_KEY`         | API 인증 키               | (필수)  |
| `TRANSPORT_TYPE`  | 전송 방식 (`stdio`/`sse`) | `stdio` |
| `PORT`            | SSE 전송용 포트           | `3000`  |

### 8. 시스템 구조

1. Figma API 연동
2. MCP 표준 인터페이스 제공
3. AI 도구 및 프롬프트 지원
4. stdio/SSE 전송 지원

### 9. 배포 가이드

#### 개발 환경 설정

```bash
# 1. 개발용 브랜치 생성
git checkout -b feature/기능명

# 2. 테스트 실행
npm test

# 3. 린트 검사
npm run lint
```

#### 배포 프로세스

```bash
# 1. 버전 업데이트
npm version patch  # 패치 버전 업데이트
npm version minor  # 마이너 버전 업데이트
npm version major  # 메이저 버전 업데이트

# 2. 변경사항 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 3. 원격 저장소 푸시
git push origin feature/기능명

# 4. PR 생성 후 main 브랜치로 병합
# GitHub UI에서 PR 생성

# 5. 배포 (자동화)
# main 브랜치 병합 시 자동 배포
```

#### 커밋 메시지 규칙

- feat: 새로운 기능 추가
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 코드 리팩토링
- test: 테스트 코드
- chore: 기타 변경사항

#### CI/CD 파이프라인

- GitHub Actions를 통한 자동화
  - 테스트 실행
  - 린트 검사
  - 타입 체크
  - 빌드 검증
  - NPM 배포

#### 배포 환경

- Node.js >= 18.x
- NPM >= 9.x
- TypeScript >= 5.x

---

_이 문서는 자동으로 생성되었습니다._
