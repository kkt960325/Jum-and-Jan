#!/usr/bin/env python3
"""
Pre-deployment pairing audit.
Picks 10 random whiskeys, shows 4 pairings each + image status.
Run: python3 scripts/audit-report.py [--seed N]
"""
import re, os, math, random, argparse
from datetime import date

# ─── CLI ────────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument('--seed', type=int, default=None)
args = parser.parse_args()

SEED = args.seed if args.seed is not None else int(date.today().strftime('%Y%m%d'))
random.seed(SEED)

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_TS   = os.path.join(PROJECT_ROOT, 'src/lib/data.ts')
FOOD_TS   = os.path.join(PROJECT_ROOT, 'src/lib/food-db.ts')
PUBLIC    = os.path.join(PROJECT_ROOT, 'public')

# ─── Parse helpers ──────────────────────────────────────────────────────────
def extract_float_list(text):
    m = re.search(r'\[([^\]]+)\]', text)
    if not m: return []
    return [float(x.strip()) for x in m.group(1).split(',') if x.strip()]

def parse_whiskeys(path):
    content = open(path, encoding='utf-8').read()
    db_start = content.find('export const WHISKEY_DB')
    db_end   = content.find('\nexport ', db_start + 1)
    section  = content[db_start:db_end] if db_end > 0 else content[db_start:]
    chunks = re.split(r'\n\s+\{(?=\s*\n?\s*id:)', section)
    whiskeys = []
    for chunk in chunks[1:]:
        id_m    = re.search(r"id:\s*'([^']+)'", chunk)
        name_m  = re.search(r"name:\s*'([^']+)'", chunk)
        vec_m   = re.search(r'flavorVector:\s*(\[[^\]]+\])', chunk)
        img_m   = re.search(r"image:\s*'([^']+)'", chunk)
        price_m = re.search(r"dailyShot:\s*(\d+)", chunk)
        prof_m  = re.search(r"profileType:\s*'([^']+)'", chunk)
        desc_m  = re.search(r"description:\s*'([^']+)'", chunk)
        if not (id_m and name_m and vec_m): continue
        whiskeys.append({
            'id':          id_m.group(1),
            'name':        name_m.group(1),
            'flavorVector': extract_float_list(vec_m.group(0)),
            'image':       img_m.group(1) if img_m else None,
            'price':       int(price_m.group(1)) if price_m else 70000,
            'profileType': prof_m.group(1) if prof_m else '',
            'description': desc_m.group(1)[:60] if desc_m else '',
        })
    return whiskeys

def parse_foods(path):
    content = open(path, encoding='utf-8').read()
    db_start = content.find('export const FOOD_DB_V2')
    section  = content[db_start:]
    chunks   = re.split(r'\n\s+\{(?=\s*\n?\s*id:)', section)
    foods = []
    for chunk in chunks[1:]:
        id_m    = re.search(r"id:\s*'([^']+)'", chunk)
        name_m  = re.search(r"name:\s*'([^']+)'", chunk)
        tier_m  = re.search(r"tier:\s*'([^']+)'", chunk)
        vec_m   = re.search(r'foodVector:\s*(\[[^\]]+\])', chunk)
        comp_m  = re.search(r'compounds:\s*\[([^\]]+)\]', chunk)
        dtype_m = re.search(r"dishType:\s*'([^']+)'", chunk)
        if not (id_m and name_m and tier_m and vec_m): continue
        compounds = re.findall(r"'([^']+)'", comp_m.group(1)) if comp_m else []
        foods.append({
            'id':        id_m.group(1),
            'name':      name_m.group(1),
            'tier':      tier_m.group(1),
            'foodVector': extract_float_list(vec_m.group(0)),
            'compounds': compounds,
            'dishType':  dtype_m.group(1) if dtype_m else '',
        })
    return foods

# ─── Pairing logic ──────────────────────────────────────────────────────────
COMPOUND_SETS = {
    'peaty':   {'guaiacol','syringol','phenol','eugenol','dimethyl sulfide'},
    'sweet':   {'vanillin','lactones','furfural','diacetyl','esters','isoamyl acetate'},
    'nutty':   {'pyrazines','furfural'},
    'citrus':  {'limonene','linalool','isoamyl acetate'},
    'floral':  {'linalool','geraniol','eugenol'},
    'fermented':{'lactic acid','acetic acid','butyric acid','amines'},
    'maritime':{'dimethyl sulfide','amines','isoamyl acetate'},
}

def cosine(a, b):
    dot = sum(x*y for x,y in zip(a,b))
    na  = math.sqrt(sum(x*x for x in a))
    nb  = math.sqrt(sum(x*x for x in b))
    if na < 1e-9 or nb < 1e-9: return 0.0
    return dot / (na * nb)

def synergy(whiskey, food):
    wc = set(whiskey.get('compounds', []) if isinstance(whiskey, dict) else [])
    fc = set(food['compounds'])
    shared = len(wc & fc)
    vec_sim = cosine(whiskey['flavorVector'], food['foodVector'])
    return vec_sim * 0.6 + (shared / max(len(wc), 1)) * 0.4

def best_for_tier(whiskey, foods, tier):
    candidates = [f for f in foods if f['tier'] == tier]
    if not candidates: return None
    daily_seed = int(date.today().strftime('%Y%m%d'))
    scored = sorted(candidates, key=lambda f: synergy(whiskey, f), reverse=True)
    top8 = scored[:8]
    return top8[daily_seed % len(top8)]

def adventurous_match(whiskey, foods):
    wc = set(whiskey.get('compounds', []) if isinstance(whiskey, dict) else [])
    daily_seed = int(date.today().strftime('%Y%m%d'))
    scored = []
    for food in foods:
        fc = set(food['compounds'])
        vec_sim = cosine(whiskey['flavorVector'], food['foodVector'])
        contrast = max(0.0, 1.0 - vec_sim)
        shared   = len(wc & fc)
        # Bridge: needs some compound overlap but low vector similarity
        if shared == 0 and contrast < 0.3:
            continue
        adv_score = contrast * 0.4 + (shared / max(len(wc), 1)) * 0.6
        scored.append((adv_score, food))
    scored.sort(key=lambda x: x[0], reverse=True)
    if not scored:
        # fallback: most contrasting
        scored = [(max(0.0, 1.0 - cosine(whiskey['flavorVector'], f['foodVector'])), f) for f in foods]
        scored.sort(reverse=True)
    top8 = scored[:8]
    _, food = top8[daily_seed % len(top8)]
    return food

# ─── Image check ────────────────────────────────────────────────────────────
def img_status(whiskey):
    img = whiskey.get('image')
    if not img:
        return '❌ 없음'
    path = os.path.join(PUBLIC, img.lstrip('/'))
    return '✅' if os.path.exists(path) else f'⚠ 파일없음'

# ─── Main ────────────────────────────────────────────────────────────────────
whiskeys = parse_whiskeys(DATA_TS)
foods    = parse_foods(FOOD_TS)

sample = random.sample(whiskeys, 10)

# Column widths
W_NAME = 22
W_FOOD = 18

HEADER = (
    f"{'#':>2}  {'위스키':<{W_NAME}}  {'가격':>6}  {'이미지':>5}  "
    f"{'입문용 안주':<{W_FOOD}}  {'미들급 안주':<{W_FOOD}}  "
    f"{'프리미엄 안주':<{W_FOOD}}  {'모험적 매칭':<{W_FOOD}}"
)
SEP = '─' * len(HEADER)

print()
print('┌' + '─' * (len(HEADER) + 2) + '┐')
print('│  🥃 Jum & Jan — 사전 배포 페어링 감사 리포트' + ' ' * max(0, len(HEADER) - 43) + '  │')
print(f'│  날짜: {date.today()}  시드: {SEED}' + ' ' * max(0, len(HEADER) - 28) + '  │')
print('└' + '─' * (len(HEADER) + 2) + '┘')
print()
print(HEADER)
print(SEP)

for i, w in enumerate(sample, 1):
    low  = best_for_tier(w, foods, 'low')
    mid  = best_for_tier(w, foods, 'medium')
    high = best_for_tier(w, foods, 'high')
    adv  = adventurous_match(w, foods)

    price_str = f"₩{w['price']//1000}K"
    name_str  = w['name'][:W_NAME]
    low_str   = (low['name']  if low  else '─')[:W_FOOD]
    mid_str   = (mid['name']  if mid  else '─')[:W_FOOD]
    high_str  = (high['name'] if high else '─')[:W_FOOD]
    adv_str   = (adv['name']  if adv  else '─')[:W_FOOD]

    print(
        f"{i:>2}  {name_str:<{W_NAME}}  {price_str:>6}  {img_status(w):>5}  "
        f"{low_str:<{W_FOOD}}  {mid_str:<{W_FOOD}}  "
        f"{high_str:<{W_FOOD}}  {adv_str:<{W_FOOD}}"
    )

print(SEP)
print(f'\n총 위스키 DB: {len(whiskeys)}종  |  한식 안주 DB: {len(foods)}종')

# Diversity check: count unique food names across all 40 pairings
all_foods = set()
for w in sample:
    for tier in ('low','medium','high'):
        f = best_for_tier(w, foods, tier)
        if f: all_foods.add(f['id'])
    adv = adventurous_match(w, foods)
    if adv: all_foods.add(adv['id'])
print(f'40개 추천 중 고유 안주 종류: {len(all_foods)}종 (다양성 지수)')
print()

# Full detail table
print('─' * 80)
print(' 상세 매칭 내역')
print('─' * 80)
for i, w in enumerate(sample, 1):
    sim_low  = cosine(w['flavorVector'], best_for_tier(w, foods, 'low')['foodVector']) if best_for_tier(w, foods, 'low') else 0
    print(f"\n  {i:>2}. {w['name']} [{w['profileType']}]")
    print(f"      설명: {w['description']}")
    print(f"      이미지: {img_status(w)}")
    for tier, label in [('low','입문용'), ('medium','미들급'), ('high','프리미엄')]:
        f = best_for_tier(w, foods, tier)
        if f:
            sim = cosine(w['flavorVector'], f['foodVector'])
            dtype = f'({f["dishType"]})' if f.get('dishType') else ''
            print(f"      [{label}] {f['name']} {dtype}  — 유사도 {sim:.2f}")
    adv = adventurous_match(w, foods)
    if adv:
        dtype = f'({adv["dishType"]})' if adv.get('dishType') else ''
        adv_sim = cosine(w['flavorVector'], adv['foodVector'])
        print(f"      [모험적]  {adv['name']} {dtype}  — 대조도 {1-adv_sim:.2f}")
print()
