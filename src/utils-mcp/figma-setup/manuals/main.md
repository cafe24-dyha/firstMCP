# Figma Setup 매뉴얼

## 1. 시스템 개요

- **시스템명**: Figma Setup System
- **목적**: Figma 프로젝트 설정 자동화 및 관리
- **버전**: 1.0.0

## 2. 주요 기능

- Figma 프로젝트 자동 설정
- 컴포넌트 라이브러리 관리
- 스타일 시스템 설정
- 플러그인 관리

## 3. 디렉토리 구조

```
figma-setup/
├── scripts-main/     # 메인 스크립트
├── manuals/         # 매뉴얼 문서
├── templates/       # 템플릿 파일
└── logs/           # 로그 파일
```

## 4. 핵심 모듈

### 4.1 설정 관리

- `setup-manager.ts`: 설정 프로세스 관리
- `setup-checker.ts`: 설정 상태 검증
- `setup-validator.ts`: 입력값 검증
- `template-manager.ts`: 템플릿 관리

### 4.2 백업 및 캐시

- `backup-manager.ts`: 백업 생성 및 복원
- `cache-manager.ts`: 캐시 관리
- `logger.ts`: 로깅 시스템

## 5. 설정 관리

### 5.1 기본 설정

```json
{
  "debug_mode": true,
  "auto_backup": true,
  "log_level": "info",
  "max_backups": 10,
  "cache_ttl": 300
}
```

### 5.2 확장 설정

- 컴포넌트 네이밍 규칙
- 스타일 시스템 구조
- 플러그인 설정

## 6. 유지보수 가이드

### 6.1 로그 관리

- 로그 위치: `logs/` 디렉토리
- 로그 레벨: DEBUG, INFO, ERROR
- 로그 포맷: `[시간][레벨] 메시지`

### 6.2 백업 관리

- 백업 위치: `backups/` 디렉토리
- 자동 백업: 매일 1회
- 보관 기간: 최근 10개
- 압축 및 암호화 지원

## 7. 문제 해결

### 7.1 일반적인 문제

1. 설정 검증 실패
2. 템플릿 오류
3. 동기화 문제

### 7.2 디버깅 정보

- 디버그 모드 활성화: `debug_mode: true`
- 상세 로그 확인: `logs/debug.log`
- 오류 로그: `logs/error.log`
