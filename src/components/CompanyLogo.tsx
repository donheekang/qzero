"use client";

import { useState } from "react";
import { getBrandInfo } from "@/lib/logos";

interface CompanyLogoProps {
  centerId: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

/* ── Toss-style sizes ── */
const SIZES = {
  xs: { box: "w-8 h-8", text: "text-[10px]", r: "rounded-[10px]", px: 32, pad: "p-1" },
  sm: { box: "w-10 h-10", text: "text-[11px]", r: "rounded-[12px]", px: 40, pad: "p-1.5" },
  md: { box: "w-[46px] h-[46px]", text: "text-[12px]", r: "rounded-[13px]", px: 46, pad: "p-[6px]" },
  lg: { box: "w-[52px] h-[52px]", text: "text-sm", r: "rounded-[15px]", px: 52, pad: "p-[7px]" },
};

/* ── Domain map ── */
const DOMAIN_MAP: Record<string, string> = {
  skt: "tworld.co.kr",
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
    if (urlIndex < logoUrls.length - 1) setUrlIndex(urlIndex + 1);
    else setAllFailed(true);
  };

  /* Image logo */
  if (domain && !allFailed && logoUrls.length > 0) {
    return (
      <div className={`${s.box} ${s.r} shrink-0 overflow-hidden bg-white border border-[#F2F3F5] flex items-center justify-center ${className}`}>
        <img
          src={logoUrls[urlIndex]}
          alt={`${brand.initial} logo`}
          width={s.px}
          height={s.px}
          className={`${s.box} object-contain ${s.pad}`}
          onError={handleError}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  /* Fallback text icon */
  return (
    <div
      className={`${s.box} ${s.r} flex items-center justify-center shrink-0 border border-[#F2F3F5] ${className}`}
      style={{ background: brand.bgColor }}
    >
      <span className={`${s.text} font-bold leading-none`} style={{ color: brand.textColor }}>
        {brand.initial}
      </span>
    </div>
  );
}
