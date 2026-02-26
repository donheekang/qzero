import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qzero - 고객센터, 더 이상 기다리지 마세요",
  description:
    "고객센터 문제를 가장 빨리 해결하는 AI 플랫폼. 전화 없이 해결하거나, ARS 최단 경로와 최적 통화 시간을 안내합니다.",
  keywords: [
    "고객센터",
    "상담원 연결",
    "ARS",
    "SKT 고객센터",
    "국민은행 고객센터",
    "쿠팡 고객센터",
  ],
  openGraph: {
    title: "Qzero - 고객센터 문제 해결 AI",
    description: "전화 안 해도 되는 길 찾아드려요. ARS 최단 경로 & 최적 통화 시간 안내.",
    url: "https://qzero.kr",
    siteName: "Qzero",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white">
        <div className="mx-auto max-w-lg min-h-screen safe-area">
          {children}
        </div>
      </body>
    </html>
  );
}
