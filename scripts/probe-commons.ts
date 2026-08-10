#!/usr/bin/env tsx
// Debug: list all images on Redbreast and Dalmore Wikipedia pages
const WP  = 'https://en.wikipedia.org/w/api.php';
const COM = 'https://commons.wikimedia.org/w/api.php';
const HDR = { 'User-Agent': 'JumAndJan/1.0', 'Accept': 'application/json' };

async function get(url: string) {
  const r = await fetch(url, { headers: HDR, signal: AbortSignal.timeout(8000) });
  return r.ok ? r.json() as Promise<Record<string, unknown>> : null;
}

async function fileInfo(title: string) {
  const d = await get(`${COM}?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size&format=json`);
  const p = Object.values((d?.query as Record<string,unknown>)?.pages as Record<string,unknown> ?? {})[0] as Record<string,unknown>;
  const ii = ((p?.imageinfo ?? []) as Array<{url?:string;width?:number;height?:number}>)[0];
  return ii?.url ? `${ii.width}x${ii.height} ${ii.url}` : null;
}

async function listPageImages(page: string, label: string) {
  console.log(`\n=== ${label} (${page}) ===`);
  const d = await get(`${WP}?action=query&titles=${encodeURIComponent(page)}&prop=images&format=json&imlimit=30`);
  const pg = Object.values((d?.query as Record<string,unknown>)?.pages as Record<string,unknown> ?? {})[0] as Record<string,unknown>;
  const imgs = (pg?.images ?? []) as Array<{title:string}>;
  for (const img of imgs) {
    const info = await fileInfo(img.title);
    if (info) console.log(img.title, '->', info.slice(0, 80));
    await new Promise(r => setTimeout(r, 150));
  }
}

// Also search Commons directly
async function commonsSearch(q: string) {
  console.log(`\n--- Commons search: "${q}" ---`);
  const d = await get(`${COM}?action=query&list=search&srsearch=${encodeURIComponent(q)}&srnamespace=6&srlimit=10&format=json`);
  const hits = ((d?.query as Record<string,unknown>)?.search ?? []) as Array<{title:string}>;
  for (const h of hits) {
    const info = await fileInfo(h.title);
    if (info) console.log(h.title, '->', info.slice(0, 80));
    await new Promise(r => setTimeout(r, 150));
  }
}

(async () => {
  await listPageImages('Redbreast_(whiskey)', 'Redbreast');
  await listPageImages('The_Dalmore_distillery', 'Dalmore');
  await commonsSearch('Dalmore whisky');
  await commonsSearch('Dalmore scotch bottle');
  await commonsSearch('Redbreast Irish whiskey');
})();
