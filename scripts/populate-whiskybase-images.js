/**
 * Whiskybase 이미지 URL을 Supabase에 일괄 저장
 * Chrome DevTools Console에서 실행 (whiskybase.com 탭에서)
 * 
 * 사용법:
 * 1. https://www.whiskybase.com 열기 (Cloudflare 통과 후)
 * 2. F12 → Console 탭
 * 3. 이 스크립트 전체 붙여넣기 후 Enter
 */

const SUPABASE_URL = 'https://basnheqtjlxcsmzsxpqg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9FdofmTfpN51Z0OcjC-hKQ_R6bd9v0c';

// wb-mapping.json에서 가져온 데이터 (이미 image_url 있는 37개 포함)
// 아래 ITEMS는 fetch-and-run 방식으로 로딩
async function main() {
  // 1. wb-mapping.json 로드
  const mappingRes = await fetch('https://raw.githubusercontent.com/kkt960325/Jum-and-Jan/main/wb-mapping.json');
  const mapping = await mappingRes.json();
  
  const IMAGE_RE = /https:\/\/static\.whiskybase\.com\/storage\/whiskies\/[^"'\s]+?-big\.jpg/;
  
  let saved = 0, failed = 0, skipped = 0;
  const results = [];
  
  // 2. 이미 image_url 있는 것들 먼저 Supabase에 저장
  const alreadyHaveUrl = mapping.whiskies.filter(w => w.image_url);
  console.log(`✅ 이미 URL 있음: ${alreadyHaveUrl.length}개 → Supabase 저장 중...`);
  
  for (const w of alreadyHaveUrl) {
    results.push({ wb_id: w.wb_id, whiskey_id: w.id, image_url: w.image_url });
  }
  
  // 3. URL 없는 것들 Whiskybase에서 fetch
  const needFetch = mapping.whiskies.filter(w => w.wb_id && !w.image_url);
  console.log(`🔍 fetch 필요: ${needFetch.length}개`);
  
  const BATCH = 6;
  const DELAY = 1000;
  
  for (let i = 0; i < needFetch.length; i += BATCH) {
    const batch = needFetch.slice(i, i + BATCH);
    
    const batchResults = await Promise.all(batch.map(async w => {
      try {
        const res = await fetch(`https://www.whiskybase.com/whiskies/whisky/${w.wb_id}/`, {
          headers: { 'Accept': 'text/html' }
        });
        const html = await res.text();
        const match = html.match(IMAGE_RE);
        if (match) {
          return { wb_id: w.wb_id, whiskey_id: w.id, image_url: match[0] };
        }
        return null;
      } catch { return null; }
    }));
    
    batchResults.forEach(r => r && results.push(r));
    
    const done = Math.min(i + BATCH, needFetch.length);
    console.log(`진행: ${done}/${needFetch.length} | 수집: ${results.length - alreadyHaveUrl.length}개`);
    
    if (i + BATCH < needFetch.length) await new Promise(r => setTimeout(r, DELAY));
  }
  
  // 4. Supabase에 upsert (100개씩 배치)
  console.log(`\n📤 Supabase에 ${results.length}개 저장 중...`);
  
  for (let i = 0; i < results.length; i += 100) {
    const chunk = results.slice(i, i + 100);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/whisky_images`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(chunk),
    });
    
    if (res.ok) {
      saved += chunk.length;
      console.log(`  저장 완료: ${saved}개`);
    } else {
      const err = await res.text();
      console.error(`  저장 실패:`, err);
      failed += chunk.length;
    }
  }
  
  console.log(`\n🎉 완료! 저장: ${saved}개 / 실패: ${failed}개`);
}

main().catch(console.error);
