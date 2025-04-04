# MCP Manual

## 개요
이 시스템은 Figma 디자인 시스템을 기반으로 자동화된 매뉴얼을 생성합니다.
This is an automatically generated manual.
버전: 1.0.0
생성일: 2025. 4. 4. 오전 8:36:50

## 주요 기능
- Figma API 통합
- 디자인 토큰 변환
- 자동화된 스타일 가이드 생성
- 자동 백업 관리

## 사용 방법
```bash
npx ts-node manual-index.ts [옵션]
```

### 옵션
- `-y`: 자동 승인
- `--path=경로`: 대상 경로 지정

## 시스템 요구사항
- Node.js v18+
- npm v9+
- TypeScript v5+

## 구현 세부사항
시스템은 모듈식 구조로 설계되어 있으며, 각 컴포넌트는 독립적으로 동작합니다.
- 매뉴얼 생성: manuals/main.md
- 백업 저장: manuals/backups/main-{timestamp}.md
- 백업 관리: 최대 10개의 백업 파일 유지
