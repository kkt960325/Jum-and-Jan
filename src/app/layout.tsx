import type { Metadata, Viewport } from "next";
import { Playfair_Display, Noto_Serif_KR, Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ClientLogger } from "@/components/ClientLogger";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif-kr",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
});

export const viewport: Viewport = {
  themeColor: "#FDFBF7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "점과 잔 | 위스키 × 한식 페어링",
    template: "%s | 점과 잔",
  },
  description: "점과 잔 — 내 취향 벡터로 찾는 위스키 × 한식 완벽 페어링. 229종 위스키 중 나에게 꼭 맞는 한 병을 찾아보세요.",
  keywords: ["점과 잔", "위스키 한식 페어링", "위스키 추천", "한식 안주", "위스키 취향 테스트", "점과잔"],
  authors: [{ name: "점과 잔" }],
  creator: "점과 잔",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://jum-and-jan.vercel.app",
    siteName: "점과 잔",
    title: "점과 잔 | 위스키 × 한식 페어링",
    description: "내 취향 벡터로 찾는 위스키 × 한식 완벽 페어링. 229종 위스키 중 나에게 꼭 맞는 한 병을 찾아보세요.",
  },
  twitter: {
    card: "summary_large_image",
    title: "점과 잔 | 위스키 × 한식 페어링",
    description: "내 취향 벡터로 찾는 위스키 × 한식 완벽 페어링.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "점과 잔",
  },
  verification: {
    google: "uDpknjy2mJaF_MC2B_CLfXGEFoOAmOR4IchInQ99sM8",
    other: {
      "naver-site-verification": "53c286b20b4c51e8ba094db1899ee44bada4e6fd",
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${playfair.variable} ${notoSerifKR.variable} ${inter.variable} ${notoSansKR.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans tracking-tight">
        <ClientLogger />
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
