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
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-white">
        <div className="mx-auto max-w-lg min-h-screen safe-area relative">
          <div className="pb-20">
            {children}
          </div>
          {/* Bottom Navigation */}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav-blur border-t border-black/[0.04]">
      <div className="mx-auto max-w-lg flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <a href="/" className="flex flex-col items-center gap-1 px-4 py-1">
          <svg className="w-6 h-6 text-[#3182F6]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[11px] font-semibold text-[#3182F6] tracking-[-0.2px]">홈</span>
        </a>
        <a href="/search" className="flex flex-col items-center gap-1 px-4 py-1">
          <svg className="w-6 h-6 text-[#B0B8C1]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[11px] font-medium text-[#B0B8C1] tracking-[-0.2px]">검색</span>
        </a>
        <a href="/timer" className="flex flex-col items-center gap-1 px-4 py-1">
          <svg className="w-6 h-6 text-[#B0B8C1]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[11px] font-medium text-[#B0B8C1] tracking-[-0.2px]">타이머</span>
        </a>
        <button className="flex flex-col items-center gap-1 px-4 py-1">
          <svg className="w-6 h-6 text-[#B0B8C1]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[11px] font-medium text-[#B0B8C1] tracking-[-0.2px]">내 정보</span>
        </button>
      </div>
    </nav>
  );
}
