"use client";

import { useState } from "react";
import { getBrandInfo } from "@/lib/logos";

interface CompanyLogoProps {
  centerId: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  xs: { container: "w-8 h-8", text: "text-[10px]", radius: "rounded-lg", px: 32 },
  sm: { container: "w-10 h-10", text: "text-xs", radius: "rounded-xl", px: 40 },
  md: { container: "w-12 h-12", text: "text-sm", radius: "rounded-xl", px: 48 },
  lg: { container: "w-14 h-14", text: "text-base", radius: "rounded-2xl", px: 56 },
};

/**
 * 기업 도메인 매핑 - 실제 파비콘/로고 로드용
 */
const DOMAIN_MAP: Record<string, string> = {
  skt: "sktelecom.com",
  kt: "kt.com",
  lguplus: "lguplus.com",
  kbbank: "kbstar.com",
  shinhanbank: "shinhan.com",
  hanabank: "kebhana.com",
  wooribank: "wooribank.com",
  nonghyup: "nonghyup.com",
  kakaobank: "kakaobank.com",
  kbank: "kbanknow.com",
  toss: "toss.im",
  samsungcard: "samsungcard.com",
  hyundaicard: "hyundaicard.com",
  kbcard: "kbcard.com",
  shinhancard: "shinhancard.com",
  lottecard: "lottecard.co.kr",
  samsunglife: "samsunglife.com",
  hyundaiins: "hi.co.kr",
  dbins: "idbins.com",
  nhis: "nhis.or.kr",
  nps: "nps.or.kr",
  gov24: "gov.kr",
  nts: "nts.go.kr",
  ei: "ei.go.kr",
  coupang: "coupang.com",
  "11st": "11st.co.kr",
  musinsa: "musinsa.com",
  gmarket: "gmarket.co.kr",
  ssg: "ssg.com",
  baemin: "baemin.com",
  yogiyo: "yogiyo.co.kr",
  naver: "naver.com",
  kakao: "kakaocorp.com",
  netflix: "netflix.com",
  disneyplus: "disneyplus.com",
  koreanair: "koreanair.com",
  asiana: "flyasiana.com",
  yanolja: "yanolja.com",
  cjlogistics: "cjlogistics.com",
  hanjin: "hanjin.com",
  samsung: "samsung.com",
  lg: "lg.com",
  apple: "apple.com",
  hyundaicar: "hyundai.com",
  kia: "kia.com",
  daangn: "daangn.com",
  oliveyoung: "oliveyoung.co.kr",
  ohouse: "ohou.se",
};

/**
 * 로고 URL 소스들 (순서대로 시도)
 * 1. Google gstatic Favicon API - 가장 안정적
 * 2. Google s2 Favicon API - 폴백
 */
function getLogoUrls(domain: string): string[] {
  return [
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];
}

export default function CompanyLogo({ centerId, size = "md", className = "" }: CompanyLogoProps) {
  const brand = getBrandInfo(centerId);
  const s = SIZES[size];
  const [urlIndex, setUrlIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);
  const domain = DOMAIN_MAP[centerId];

  const logoUrls = domain ? getLogoUrls(domain) : [];

  const handleError = () => {
    if (urlIndex < logoUrls.length - 1) {
      setUrlIndex(urlIndex + 1);
    } else {
      setAllFailed(true);
    }
  };

  // 이미지 로고
  if (domain && !allFailed && logoUrls.length > 0) {
    return (
      <div
        className={`${s.container} ${s.radius} shrink-0 overflow-hidden bg-white shadow-toss flex items-center justify-center ${className}`}
      >
        <img
          src={logoUrls[urlIndex]}
          alt={`${brand.initial} logo`}
          width={s.px}
          height={s.px}
          className={`${s.container} object-contain p-1.5`}
          onError={handleError}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Fallback: 그라데이션 텍스트 아이콘
  return (
    <div
      className={`${s.container} ${s.radius} flex items-center justify-center shrink-0 shadow-toss ${className}`}
      style={{
        background: `linear-gradient(135deg, ${brand.bgColor}, ${adjustColor(brand.bgColor, 20)})`,
      }}
    >
      <span
        className={`${s.text} font-extrabold leading-none`}
        style={{ color: brand.textColor }}
      >
        {brand.initial}
      </span>
    </div>
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
