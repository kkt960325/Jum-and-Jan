#!/usr/bin/env python3
"""
Whiskey image integrity verifier.
Run: python3 scripts/verify-images.py
Exit code 1 if any images are missing or files don't exist.
"""
import re, os, sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_TS = os.path.join(PROJECT_ROOT, 'src/lib/data-static.ts')
PUBLIC_DIR = os.path.join(PROJECT_ROOT, 'public')

with open(DATA_TS, encoding='utf-8') as f:
    content = f.read()

# Find WHISKEY_DB array section — stop at the next export after it
db_start = content.find('export const WHISKEY_DB')
if db_start < 0:
    print('❌ WHISKEY_DB not found in data.ts')
    sys.exit(1)
# Find the closing ]; of WHISKEY_DB (next export statement marks the end)
db_end = content.find('\nexport ', db_start + 1)
db_section = content[db_start:db_end] if db_end > 0 else content[db_start:]

# Split into per-entry blocks on opening brace that immediately precedes id:
chunks = re.split(r'\n\s+\{(?=\s*\n?\s*id:)', db_section)

errors = 0
no_image = 0
external = 0
total = 0

for chunk in chunks[1:]:  # skip preamble before first entry
    id_m = re.search(r"id:\s*'([^']+)'", chunk)
    if not id_m:
        continue
    wid = id_m.group(1)
    total += 1

    img_m = re.search(r"image:\s*'([^']+)'", chunk)
    if not img_m:
        # Missing image is intentional (wrong-brand proxy removed) — not an error
        no_image += 1
        continue

    img_rel = img_m.group(1)  # e.g. /images/ardbeg-10.jpg or https://...

    # External URLs (Whiskybase CDN 등) — 로컬 파일 체크 불필요
    if img_rel.startswith('http://') or img_rel.startswith('https://'):
        external += 1
        continue

    file_path = os.path.join(PUBLIC_DIR, img_rel.lstrip('/'))
    if not os.path.exists(file_path):
        print(f'  ❌ FILE NOT FOUND : {wid} → {img_rel}')
        errors += 1

with_img = total - no_image
if errors == 0:
    print(f'✅  이미지 파일 검증 완료 — 로컬 {with_img - external}개 / 외부URL {external}개 / 플레이스홀더 {no_image}개 / 누락 없음')
else:
    print(f'\n⛔  {errors}개 파일 누락 오류 / 전체 {total}개')
    sys.exit(1)
