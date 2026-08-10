async function test() {
  const url = 'https://www.whiskybase.com/search?q=balvenie+12';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    const html = await res.text();
    console.log('HTML Length:', html.length);
    console.log('Is Cloudflare Blocked:', html.includes('cloudflare') || html.includes('Just a moment'));
  } catch (e) {
    console.error('Error fetching:', e);
  }
}
test();
