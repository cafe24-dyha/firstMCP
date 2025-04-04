# Figma Setup 제어 매뉴얼

## 1. 시스템 명령어

### 1.1 설정 명령어

```bash
npm run setup-figma       # Figma 프로젝트 초기 설정
npm run validate-styles   # 스타일 시스템 검증
npm run sync-components   # 컴포넌트 동기화
npm run check-plugins     # 플러그인 상태 확인
```

### 1.2 백업 및 캐시 관리

```bash
npm run backup-create     # 백업 생성
npm run backup-restore    # 백업 복원
npm run cache-clear      # 캐시 초기화
npm run cache-status     # 캐시 상태 확인
```

## 2. 시스템 제어

### 2.1 프로세스 관리

- 설정 시작: `npm run setup-manager start`
- 설정 중지: `npm run setup-manager stop`
- 상태 확인: `npm run setup-checker status`

### 2.2 모니터링

- 스타일 검증: `npm run setup-validator styles`
- 템플릿 검증: `npm run template-validator check`
- 가이드 업데이트: `npm run update-guide`

## 3. 오류 처리

### 3.1 오류 코드

- F001: 스타일 동기화 실패
- F002: 컴포넌트 검증 실패
- F003: 플러그인 호환성 오류
- B001: 백업 생성 실패
- B002: 백업 복원 실패
- C001: 캐시 초기화 실패

### 3.2 문제 해결

1. 스타일 시스템 검증
2. 컴포넌트 구조 확인
3. 플러그인 상태 점검
4. 백업 상태 확인
5. 캐시 상태 확인

## 4. 설정 관리

### 4.1 환경 변수

```bash
FIGMA_TOKEN=xxx        # Figma API 토큰
STYLE_MODE=sync       # 스타일 동기화 모드
PLUGIN_DEBUG=true     # 플러그인 디버그 모드
BACKUP_ENCRYPT=true   # 백업 암호화 활성화
CACHE_TTL=300        # 캐시 유효 시간
```

### 4.2 설정 파일

- `figma.config.json`: Figma 설정
- `styles.config.json`: 스타일 설정
- `plugins.config.json`: 플러그인 설정
- `backup.config.json`: 백업 설정
- `cache.config.json`: 캐시 설정

## 5. 스크립트 보호 메커니즘

### 5.1 잠금 시스템

```bash
.template.lock        # 템플릿 잠금 파일
.script.lock         # 스크립트 잠금 파일
.style.lock          # 스타일 잠금 파일
.backup.lock         # 백업 잠금 파일
```

### 5.2 보호 규칙

- 동시 수정 방지: 한 번에 하나의 프로세스만 수정 가능
- 자동 백업: 수정 전 자동 백업 생성 (최대 10개 유지)
- 충돌 감지: 잠금 파일 기반 충돌 방지
- 자동 복구: 비정상 종료 시 자동 잠금 해제

### 5.3 잠금 명령어

```bash
npm run lock-template    # 템플릿 잠금
npm run unlock-template  # 템플릿 잠금 해제
npm run check-locks     # 잠금 상태 확인
```

## 6. 시스템 모니터링

### 6.1 상태 확인

```bash
npm run check-setup     # 설정 상태 확인
npm run verify-styles   # 스타일 검증
npm run analyze-comp    # 컴포넌트 분석
npm run backup-status   # 백업 상태 확인
npm run cache-stats     # 캐시 통계 확인
```

### 6.2 로그 관리

- 설정 로그: `logs/setup.log`
- 스타일 로그: `logs/styles.log`
- 컴포넌트 로그: `logs/components.log`
- 백업 로그: `logs/backup.log`
- 캐시 로그: `logs/cache.log`

## 7. 유지보수

### 7.1 정기 작업

- 스타일 동기화: 일 1회
- 컴포넌트 검증: 주 1회
- 플러그인 업데이트: 월 1회
- 백업 정리: 주 1회
- 캐시 정리: 일 1회

### 7.2 시스템 업데이트

- 스타일: `npm run update-styles`
- 컴포넌트: `npm run update-components`
- 플러그인: `npm run update-plugins`
- 백업: `npm run update-backup`
- 캐시: `npm run update-cache`
