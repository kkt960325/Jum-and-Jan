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
  title: "Jum & Jan | Whiskey-Hansik Pairing",
  description: "최고의 위스키와 한식의 완벽한 페어링을 제안합니다.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jum & Jan",
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
