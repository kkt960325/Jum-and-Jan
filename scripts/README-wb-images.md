# Whiskybase Image Matching — 사용 가이드

## 파일 구조

```
wb-mapping.json              ← WB ID + 이미지 URL 매핑 (229개 위스키)
scripts/
  fetch-wb-images.mjs        ← Step 1: whiskybase 페이지에서 이미지 URL 수집
  update-data-static.mjs     ← Step 2: data-static.ts에 이미지 URL 반영
  build-wb-mapping.py        ← WB ID 데이터 빌드용 (참고용)
```

## 실행 방법

### Step 1: 이미지 URL 수집 (로컬에서 실행)

```bash
# 전체 수집 (약 192개 위스키, ~4분 소요)
node scripts/fetch-wb-images.mjs

# 테스트: 처음 10개만
node scripts/fetch-wb-images.mjs --limit 10

# 특정 위스키만
node scripts/fetch-wb-images.mjs --id glenfiddich-12

# 확인만 (실제 요청 없음)
node scripts/fetch-wb-images.mjs --dry-run
```

진행 상황은 wb-mapping.json에 자동 저장됩니다 (10개마다).

### Step 2: data-static.ts 업데이트

```bash
node scripts/update-data-static.mjs

# 변경사항 미리 보기
node scripts/update-data-static.mjs --dry-run
```

## 현재 상태

- **229개** 위스키에 WB ID 매핑 완료
- **37개** (Islay 전체) 이미지 URL 완료
- **192개** 이미지 URL 수집 필요 → `fetch-wb-images.mjs` 실행

## WB ID 없는 위스키 (~90개)

아직 WB ID를 찾지 못한 위스키들은 수동으로 whiskybase.com에서 검색 후
`wb-mapping.json`에 `wb_id` 값을 추가하면 됩니다.

```json
{ "id": "your-whisky-id", "wb_id": 123456, "image_url": null }
```

## next.config.ts

`static.whiskybase.com` 도메인이 이미 허용 목록에 추가되어 있습니다.
Next.js `<Image>` 컴포넌트로 외부 URL을 바로 사용할 수 있습니다.
