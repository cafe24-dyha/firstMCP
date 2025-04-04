# MCP 트러블슈팅 시스템 매뉴얼

## 시스템 개요

- **목적**: MCP 시스템의 에러를 자동으로 감지하고 해결하는 자율 트러블슈팅 시스템
- **위치**: `@troubleshooting/scripts/`
- **처리 결과**: `@troubleshooting/manuals/troubleshooting.md`

## 주요 기능

1. **에러 감지 및 분류**

   - 실시간 에러 모니터링
   - 에러 유형 자동 분류
   - 중복 에러 필터링

2. **자동 복구 시스템**

   - 최대 3회 복구 시도
   - 템플릿 기반 자동 복구
   - 복구 성공/실패 기록

3. **매뉴얼 자동 업데이트**
   - 에러 발생 시 실시간 업데이트
   - 해결 방법 자동 기록
   - 복구 이력 관리

## 에러 카테고리

### Figma Plugin

- **패턴**: `/figma\..*not found/i`
- **자동복구**: 가능

### TypeScript Config

- **패턴**: `/tsconfig\.json.*error/i`
- **자동복구**: 가능

### React Integration

- **패턴**: `/react.*component.*error/i`
- **자동복구**: 불가능

## 스크립트 구성
