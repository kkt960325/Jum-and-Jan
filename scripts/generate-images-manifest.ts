import { readdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

try {
  const imagesDir = resolve(process.cwd(), 'public/images');
  const files = readdirSync(imagesDir);
  const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  
  const targetPath = resolve(process.cwd(), 'src/lib/images-manifest.json');
  writeFileSync(targetPath, JSON.stringify(imageFiles, null, 2), 'utf8');
  console.log(`✅  images-manifest.json generated with ${imageFiles.length} images.`);
} catch (e) {
  console.error('❌  Failed to generate images manifest:', e);
  process.exit(1);
}
