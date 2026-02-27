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
          <div className="pb-[72px]">
            {children}
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

function BottomNav() {
  const items = [
    {
      label: "홈",
      href: "/",
      active: true,
      icon: (
        <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.71 2.29a1 1 0 00-1.42 0l-9 9a1 1 0 000 1.42A1 1 0 003 13h1v7a2 2 0 002 2h4a1 1 0 001-1v-4h2v4a1 1 0 001 1h4a2 2 0 002-2v-7h1a1 1 0 00.71-1.71l-9-9z" />
        </svg>
      ),
    },
    {
      label: "Q헬퍼",
      href: "/search",
      active: false,
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      label: "탐색",
      href: "/timer",
      active: false,
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
      ),
    },
    {
      label: "마이",
      href: "#",
      active: false,
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path strokeLinecap="round" d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav-blur border-t border-[#F2F3F5]">
      <div className="mx-auto max-w-lg grid grid-cols-4 pb-[max(8px,env(safe-area-inset-bottom))]">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-[2px] pt-2 pb-1 ${
              item.active ? "text-[#191F28]" : "text-[#B0B8C1]"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-semibold tracking-[-0.2px]">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
