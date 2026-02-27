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
 * 기업 도메인 매핑 - 실제 파비콘 로드용
 */
const DOMAIN_MAP: Record<string, string> = {
  skt: "www.sktelecom.com",
  kt: "www.kt.com",
  lguplus: "www.lguplus.com",
  kbbank: "www.kbstar.com",
  shinhanbank: "www.shinhan.com",
  hanabank: "www.kebhana.com",
  wooribank: "www.wooribank.com",
  nonghyup: "www.nonghyup.com",
  kakaobank: "www.kakaobank.com",
  kbank: "www.kbanknow.com",
  toss: "toss.im",
  samsungcard: "www.samsungcard.com",
  hyundaicard: "www.hyundaicard.com",
  kbcard: "www.kbcard.com",
  shinhancard: "www.shinhancard.com",
  lottecard: "www.lottecard.co.kr",
  samsunglife: "www.samsunglife.com",
  hyundaiins: "www.hi.co.kr",
  dbins: "www.idbins.com",
  nhis: "www.nhis.or.kr",
  nps: "www.nps.or.kr",
  gov24: "www.gov.kr",
  nts: "www.nts.go.kr",
  ei: "www.ei.go.kr",
  coupang: "www.coupang.com",
  "11st": "www.11st.co.kr",
  musinsa: "www.musinsa.com",
  gmarket: "www.gmarket.co.kr",
  ssg: "www.ssg.com",
  baemin: "www.baemin.com",
  yogiyo: "www.yogiyo.co.kr",
  naver: "www.naver.com",
  kakao: "www.kakaocorp.com",
  netflix: "www.netflix.com",
  disneyplus: "www.disneyplus.com",
  koreanair: "www.koreanair.com",
  asiana: "flyasiana.com",
  yanolja: "www.yanolja.com",
  cjlogistics: "www.cjlogistics.com",
  hanjin: "www.hanjin.com",
  samsung: "www.samsung.com",
  lg: "www.lg.com",
  apple: "www.apple.com",
  hyundaicar: "www.hyundai.com",
  kia: "www.kia.com",
  daangn: "www.daangn.com",
  oliveyoung: "www.oliveyoung.co.kr",
  ohouse: "ohou.se",
};

export default function CompanyLogo({ centerId, size = "md", className = "" }: CompanyLogoProps) {
  const brand = getBrandInfo(centerId);
  const s = SIZES[size];
  const [imgError, setImgError] = useState(false);
  const domain = DOMAIN_MAP[centerId];

  // 이미지 로고를 사용할 수 있으면 img 태그, 아니면 텍스트 폴백
  const logoUrl = domain
    ? `https://img.logo.dev/${domain}?token=pk_a8TNhdPcSEuLHCavGQqNQw&size=128&format=png`
    : null;

  if (logoUrl && !imgError) {
    return (
      <div
        className={`${s.container} ${s.radius} shrink-0 overflow-hidden bg-white shadow-toss flex items-center justify-center ${className}`}
      >
        <img
          src={logoUrl}
          alt={`${brand.initial} logo`}
          width={s.px}
          height={s.px}
          className={`${s.container} object-contain p-1`}
          onError={() => setImgError(true)}
          loading="lazy"
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
