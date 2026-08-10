import imagesManifest from './images-manifest.json';

export const getDeepLink = (whiskeyName: string, channel: string): string => {
  const encodedName = encodeURIComponent(whiskeyName);
  
  switch (channel) {
    case 'dailyshot':
      return `https://dailyshot.co/search?q=${encodedName}`;
    case 'gs25':
      return `https://www.google.com/search?q=와인25플러스+${encodedName}`;
    case 'cu':
      return `https://pocketcu.co.kr/search/searchMain?searchWord=${encodedName}`;
    case 'dutyfree':
      return `https://m.lottedfs.com/kr/search/searchMain?searchWord=${encodedName}`;
    case 'bottlebunker':
      return `https://www.bottlebunker.com/search/result?keyword=${encodedName}`;
    default:
      return '#';
  }
};

/**
 * 위스키 ID와 DB에서 조회된 이미지 경로를 기반으로 유효한 이미지 경로를 매핑합니다.
 * 런타임 디스크 IO(fs.existsSync) 없이, 빌드타임에 생성된 images-manifest.json을 참고합니다.
 */
export function resolveWhiskeyImage(id: string, dbImage?: string | null): string | undefined {
  if (dbImage) {
    const lower = dbImage.toLowerCase();
    // 잘못된 이미지 패턴 필터링
    if (!lower.includes('glass') && !lower.includes('cup')) {
      const dbFilename = dbImage.split('/').pop() || '';
      if (imagesManifest.includes(dbFilename)) {
        return dbImage;
      }
    }
  }

  const jpgFilename = `${id}.jpg`;
  const pngFilename = `${id}.png`;

  if (imagesManifest.includes(jpgFilename)) {
    return `/images/${jpgFilename}`;
  }
  if (imagesManifest.includes(pngFilename)) {
    return `/images/${pngFilename}`;
  }

  return undefined;
}
