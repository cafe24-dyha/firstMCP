# Figma 플러그인 환경 셋업 가이드

## 1. 환경 점검 항목

{{fileStructure}}

{{dependencies}}

## 2. 자동화된 점검 항목

{{validationSteps}}

### 2.4 빌드 환경 검증

- 빌드 명령어 실행
- 타입 체크
- 번들 크기 확인

## 3. 실행 방법

{{buildCommands}}

## 4. 자동화 설정

### 4.1 자동 점검

```bash
npm run check:setup   # 전체 환경 점검
npm run check:env     # 환경만 점검
```

### 4.2 자동 수정

```bash
npm run fix:setup    # 전체 자동 수정
npm run fix:deps     # 의존성 자동 수정
```

### 4.3 가이드 업데이트

```bash
npm run docs:update  # 가이드 수동 업데이트
npm run docs:watch   # 자동 업데이트 감시
```
