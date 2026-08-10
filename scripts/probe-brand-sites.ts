#!/usr/bin/env tsx
async function check(url: string, label: string) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept': 'text/html' },
      redirect: 'follow', signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) { console.log(label, r.status); return; }
    const html = await r.text();
    const og = html.match(/og:image[^>]*content=["']([^"']+)["']/);
    const imgs = [...html.matchAll(/https?:\/\/[^\s"'<>]+(dalmore|redbreast)[^\s"'<>]*\.(jpg|jpeg|png|webp)/gi)]
      .map(m => m[0]).slice(0, 3);
    console.log(label.padEnd(15), r.status, og ? 'OG:' + og[1].slice(0, 90) : imgs.slice(0, 2).join(' | ').slice(0, 90) || 'no img');
  } catch(e: unknown) { console.log(label, 'ERR', (e as Error).message?.slice(0, 30)); }
}

const tests: [string, string][] = [
  ['https://thedalmore.com/products/', 'dalmore-products'],
  ['https://thedalmore.com/products/the-dalmore-12-year-old/', 'dalmore-12'],
  ['https://thedalmore.com/products/the-dalmore-25-year-old/', 'dalmore-25'],
  ['https://thedalmore.com/whisky/12-year-old/', 'dalmore-12b'],
  ['https://thedalmore.com/whisky/25-year-old/', 'dalmore-25b'],
  ['https://www.redbreastwhiskey.com/en-us/our-whiskeys/', 'redbreast-all'],
  ['https://www.redbreastwhiskey.com/en-us/our-whiskeys/redbreast-12-year-old/', 'redbreast-12'],
  ['https://www.redbreastwhiskey.com/en-us/our-whiskeys/redbreast-21-year-old/', 'redbreast-21'],
];

(async () => {
  for (const [url, label] of tests) {
    await check(url, label);
    await new Promise(r => setTimeout(r, 400));
  }
})();
