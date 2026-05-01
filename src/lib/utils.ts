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
