import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jum & Jan | Whiskey-Hansik Pairing",
    short_name: "Jum & Jan",
    description: "당신의 입맛에 맞는 위스키와 한식 페어링을 추천해 드립니다.",
    start_url: '/',
    display: 'standalone',
    background_color: '#FDFBF7',
    theme_color: '#FDFBF7',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
