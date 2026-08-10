import { WHISKEY_DB } from './data-static';

export interface ManifestEntry {
  id: string;
  name: string;
  image: string;
  imageVerified: boolean;
  price: number;
  priceCategory: 'entry' | 'middle' | 'high-end';
}

function computeImageVerified(id: string, image: string): boolean {
  const stem = image.replace(/^\/images\//, '').replace(/\.[^.]+$/, '');
  if (stem === id) return true;
  if (id.startsWith(stem + '-') && stem.split('-').length >= 2) return true;
  return false;
}

function computePriceCategory(price: number, existing?: 'entry' | 'middle' | 'high-end'): 'entry' | 'middle' | 'high-end' {
  if (existing) return existing;
  if (price < 100000) return 'entry';
  if (price < 300000) return 'middle';
  return 'high-end';
}

export const WHISKEY_MANIFEST: ManifestEntry[] = WHISKEY_DB
  .filter((w) => w.image !== undefined)
  .map((w) => {
    const price = w.priceSimulation?.dailyShot ?? 70000;
    return {
      id: w.id,
      name: w.name,
      image: w.image as string,
      imageVerified: computeImageVerified(w.id, w.image as string),
      price,
      priceCategory: computePriceCategory(price, w.priceCategory),
    };
  });

export const VERIFIED_MANIFEST: ManifestEntry[] = WHISKEY_MANIFEST.filter(
  (e) => e.imageVerified === true
);

export function getManifestEntry(id: string): ManifestEntry | undefined {
  return WHISKEY_MANIFEST.find((e) => e.id === id);
}

export const verifiedCount = VERIFIED_MANIFEST.length;
export const totalCount = WHISKEY_MANIFEST.length;
