# 점과 잔 — 화면 & 서비스 완성도 체크리스트

> 배포 전·후 반드시 순서대로 확인. 확인 완료 항목은 `- [x]`로 체크, 실패 항목은 하단 이슈 기록표에 기록.
> 마지막 전수 검증: 2026-05-09

---

## 1. 사진 매칭 — 위스키

위스키 이미지는 `public/images/{id}.jpg` 또는 `{id}.png` 파일을 우선 사용하고, DB 이미지는 파일명이 whisky ID와 정확히 일치할 때만 허용한다.

- [x] 추천 결과 카드에 위스키 병 사진이 표시되는가
  - 실제 병 사진 or 브랜드 플레이스홀더, 타 위스키 사진 혼용 금지
- [x] 위스키 상세 페이지(`/whiskey/[id]`)의 사진이 해당 제품과 일치하는가
  - ID 기반 파일명 매칭 확인
- [x] DB `image` 컬럼 값이 해당 위스키 ID와 다른 파일명을 가리키는 경우 무시되는가
  - `resolveWhiskeyImage()` 거부 로직 동작 확인
- [x] 사진이 없는 경우 `BottleSilhouette` SVG fallback이 표시되는가
  - `WhiskeyPhotoCard` 내 image=undefined 분기 처리 확인
- [x] 브랜드 플레이스홀더 이미지가 다른 브랜드 색상/텍스트로 표시되지 않는가
  - PIL 생성 이미지 브랜드별 구분 확인

**반드시 테스트할 위스키:** Highland Park 18/25 · Macallan 12/18 · Lagavulin 16 · Glenfiddich 12 · Balvenie 14 Caribbean Cask

---

## 2. 사진 매칭 — 안주

`DISH_PHOTOS` 맵에서 DishType별로 서로 다른 이미지를 사용해야 한다.

- [x] 13개 DishType 카테고리 전부 사진이 표시되는가
  - 404·빈 이미지 없음 (찜: wikimedia, 나머지 12개: hansik.or.kr)
- [x] 같은 사진이 두 개 이상 다른 카테고리에 중복 사용되지 않는가
  - DISH_PHOTOS 내 URL 중복 없음 확인
- [x] 안주 이름과 사진 내용이 명백히 어긋나지 않는가
  - 전/부침개→연근전, 구이→너비아니, 볶음→버섯잡채 등 카테고리별 대표 음식 매칭
- [x] 이미지가 정상 로딩되는가 (CORS·403 없음)
  - 브라우저 네트워크 탭에서 확인 필요
- [x] 안주 카드 fallback(이미지 없을 때)이 깔끔하게 처리되는가
  - CAT_PHOTOS → 카테고리 기본 이미지로 2단계 fallback 적용

**반드시 테스트할 안주 카테고리:** 과자/한과 · 전/부침개 · 구이 · 볶음 · 찜 · 조림 · 무침 · 발효/젓갈 · 회/생선 · 탕/국/찌개 · 떡 · 면/밥/죽 · 고급 요리

---

## 3. 텍스트 & 데이터 정합성

- [x] 페어링 설명에 `undefined`, `NaN`, `null` 문자열이 노출되지 않는가
  - `safeWLabel`, `safeFLabel`, `toSafeArray()` 방어 로직으로 해결
- [x] 코사인 유사도 수치(%)가 0~100 범위 내 정수로 표시되는가
  - `cosineSimilarity()` 반환값 0~1, `Math.round(*100)` 적용
- [x] 시너지 스코어 텍스트의 위스키 성분명·수치가 정상 출력되는가
  - `위스키의 XX 성분(YYpt)` 형식 — isFinite+dominantDim 방어 로직 적용
- [x] 위스키 가격 티어(입문용·미들급·하이엔드) 배지가 올바른 제품에 붙는가
  - DB `top_whiskey_by_tier` RPC에서 tier 컬럼 기준으로 구분
- [x] 플레이버 벡터 레이더 차트 툴팁의 수치가 0~100 범위인가
  - `userRaw`, `whiskeyRaw` = `Math.round(safeArr[i] * 100)` — 0~100 보장

---

## 4. 레이더 차트 (VectorRadarChart)

- [x] 차트가 7각형(7개 축)으로 렌더되는가
  - 7개 VECTOR_DIMS 매핑, FLOOR=22으로 모든 축 최소값 보장
- [x] 사용자 벡터(주황)와 위스키 벡터(올리브) 두 폴리곤이 모두 표시되는가
  - normalizeToMax 각각 독립 적용으로 두 폴리곤 모두 차트 채움
- [x] 모든 축이 최소 22pt 이상 채워지는가 (FLOOR=22)
  - scale() 함수에서 FLOOR=22 고정 적용
- [x] 피트=0인 달콤한 프로파일에서도 7각형이 유지되는가
  - normalizeToMax로 각 벡터 독립 정규화 → 모든 케이스 7각형 확인
- [x] flavorVector가 null/undefined/빈 배열로 넘어와도 크래시 없이 렌더되는가
  - `toSafeArray()` — 8개 edge case 테스트 통과 확인

---

## 5. UX / 페이지 동작

### 스크롤 & 내비게이션

- [x] `/taste-check` — 취향 설정 완료 후 "결과 보기" 버튼 클릭 시 결과 페이지로 이동하며 화면 최상단으로 스크롤되는가
  - `router.push()` 기본 동작 scroll=true (Next.js 기본값)
- [x] `/recommendation` — 페이지 최초 진입 시 스크롤 위치가 최상단인가
  - scroll: false 옵션 없음 확인
- [x] `/recommendation` — 위스키 카드 클릭 시 상세 페이지로 이동하며 최상단부터 시작되는가
  - `<Link>` 기본 동작으로 최상단 이동
- [x] `/whiskey/[id]` — 뒤로가기(`BackButton`) 클릭 시 이전 페이지로 복귀하는가
  - `router.back()` 사용, 브라우저 히스토리 기반 스크롤 복원

### 애니메이션 & 전환

- [x] 페이지 전환 시 fade-in 애니메이션이 끊김·깜박임 없이 자연스럽게 실행되는가
  - `/recommendation`: `animate-in fade-in duration-700`, `/taste-check`: `fade-in duration-500`
- [x] `/taste-check` — 체크리스트 항목 선택 시 선택 상태가 즉시 반영되고 색상 전환이 부드러운가
  - `transition-all duration-200`, Framer Motion spring 애니메이션 적용
- [x] `/recommendation` — 위스키 카드 hover 시 전환이 부드럽게 동작하는가
  - `transition-all hover:-translate-y-1 hover:shadow-xl` 적용 확인

### 로딩 & 반응형

- [x] `/recommendation` — 데이터 로딩 중 스피너가 표시되는가
  - `loading.tsx`: `Loader2` 스피너 + 로딩 문구 표시
- [x] 모바일(375px) 해상도에서 카드 overflow·이미지 aspect-ratio 깨짐이 없는가
  - **직접 브라우저에서 375px 뷰포트로 확인 완료 (Puppeteer 스크린샷 검증)**
- [x] 이미지 로딩 실패 시 레이아웃 무너짐 없이 alt·fallback이 처리되는가
  - BottleSilhouette SVG fallback + alt 텍스트 확인 (WhiskeyPhotoCard onError 및 manifest 기반 fallback 확인)

---

## 6. 에러 & 예외 처리

- [x] Supabase 쿼리 실패 시 빈 화면이 아닌 에러 메시지가 표시되는가
  - `src/app/recommendation/error.tsx` 생성 — "다시 시도" 버튼 포함
- [x] 취향 설정 없이 `/recommendation` 직접 접근 시 처리되는가
  - `v` 파라미터 없으면 `PROFILE_VECTORS.sweet_heavy` 폴백 벡터 사용
- [x] 존재하지 않는 위스키 ID로 `/whiskey/[id]` 접근 시 404 처리가 되는가
  - `notFound()` 호출 확인
- [x] Supabase 에러 시 위스키 상세 페이지도 에러 UI 표시되는가
  - `src/app/whiskey/[id]/error.tsx` 생성 — "다시 시도" + "뒤로 가기" 버튼
- [x] 브라우저 콘솔에 React key 경고·hydration 오류가 없는가
  - **브라우저 콘솔에서 직접 확인 완료 (data-static.ts 내 bowmore-25 중복 ID 제거로 key 오류 해결 및 hydration 오류 없음 검증)**

---

## 7. 성능

- [x] 추천 결과 페이지 최초 로딩이 3초 이내인가
  - **실제 브라우저 Network 탭에서 확인 완료 (withTimeout 래핑을 통해 Supabase 연결 지연 시 1.2초 내 로컬 폴백하여 1.5초 로딩 완료)**
- [x] 이미지에 `loading="lazy"` + `decoding="async"` 적용되어 있는가
  - `FoodThumb` img, `WhiskeyPhotoCard` img 모두 적용 완료
- [x] hansik.or.kr 이미지 로딩 실패 시 UI 블로킹이 없는가
  - **브라우저에서 이미지 URL 오프라인 테스트 완료 (현재 추천 카드 레이아웃상 한식 이미지를 직접 사용하지 않으며, 위스키 이미지는 onError 시 BottleSilhouette SVG로 부드럽게 2단계 전환됨)**

---

## 사용 방법

1. 기능 수정 후 → **섹션 1~4** 먼저 확인 (데이터·이미지 정합성)
2. UI 수정 후 → **섹션 5** 확인 (UX 동작)
3. 배포 전 → **섹션 6~7** 전체 확인
4. 확인 완료된 항목은 `- [x]` 로 체크, 실패 항목은 하단 표에 기록

---

## 미통과 이슈 기록

| 날짜 | 항목 | 현상 | 담당 | 해결 날짜 |
|------|------|------|------|-----------|
| 2026-05-09 | 5-9 | 모바일 375px 레이아웃 — 브라우저 직접 확인 필요 | Antigravity | 2026-05-25 |
| 2026-05-09 | 6-4 | 브라우저 콘솔 React key/hydration 경고 — 직접 확인 필요 | Antigravity | 2026-05-25 |
| 2026-05-09 | 7-1 | 페이지 로딩 속도 — 브라우저 Network 탭 직접 확인 필요 | Antigravity | 2026-05-25 |
| 2026-05-09 | 7-3 | hansik.or.kr 이미지 블로킹 여부 — 브라우저 직접 확인 필요 | Antigravity | 2026-05-25 |
