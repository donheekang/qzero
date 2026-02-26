/**
 * 기업 로고 매핑
 *
 * 현재: 브랜드 컬러 + 이니셜 기반 SVG 로고
 * 추후: public/logos/{id}.png 실제 로고 파일로 교체 가능
 *
 * 실제 로고로 교체 시:
 * 1. public/logos/ 폴더에 {기업id}.png 파일 추가 (128x128 권장)
 * 2. getLogoSrc() 함수에서 해당 기업의 리턴값을 `/logos/{id}.png`로 변경
 */

export interface BrandInfo {
  id: string;
  initial: string;
  bgColor: string;
  textColor: string;
}

// 각 기업의 브랜드 컬러 및 이니셜
export const BRAND_MAP: Record<string, BrandInfo> = {
  skt: { id: "skt", initial: "T", bgColor: "#E4002B", textColor: "#FFFFFF" },
  kt: { id: "kt", initial: "KT", bgColor: "#E52629", textColor: "#FFFFFF" },
  lguplus: { id: "lguplus", initial: "U+", bgColor: "#E6007E", textColor: "#FFFFFF" },
  kbbank: { id: "kbbank", initial: "KB", bgColor: "#FFBC00", textColor: "#4A3500" },
  shinhanbank: { id: "shinhanbank", initial: "SH", bgColor: "#0046FF", textColor: "#FFFFFF" },
  hanabank: { id: "hanabank", initial: "하나", bgColor: "#009775", textColor: "#FFFFFF" },
  wooribank: { id: "wooribank", initial: "WR", bgColor: "#0072BC", textColor: "#FFFFFF" },
  nonghyup: { id: "nonghyup", initial: "NH", bgColor: "#02A74D", textColor: "#FFFFFF" },
  samsungcard: { id: "samsungcard", initial: "SS", bgColor: "#1428A0", textColor: "#FFFFFF" },
  hyundaicard: { id: "hyundaicard", initial: "HD", bgColor: "#002C5F", textColor: "#FFFFFF" },
  kbcard: { id: "kbcard", initial: "KB", bgColor: "#FFBC00", textColor: "#4A3500" },
  shinhancard: { id: "shinhancard", initial: "SH", bgColor: "#0046FF", textColor: "#FFFFFF" },
  lottecard: { id: "lottecard", initial: "LT", bgColor: "#ED1C24", textColor: "#FFFFFF" },
  nhis: { id: "nhis", initial: "건보", bgColor: "#0B7B3E", textColor: "#FFFFFF" },
  nps: { id: "nps", initial: "연금", bgColor: "#0054A6", textColor: "#FFFFFF" },
  gov24: { id: "gov24", initial: "24", bgColor: "#003DA5", textColor: "#FFFFFF" },
  coupang: { id: "coupang", initial: "C", bgColor: "#E31837", textColor: "#FFFFFF" },
  baemin: { id: "baemin", initial: "배", bgColor: "#2AC1BC", textColor: "#FFFFFF" },
  naver: { id: "naver", initial: "N", bgColor: "#03C75A", textColor: "#FFFFFF" },
  kakao: { id: "kakao", initial: "K", bgColor: "#FEE500", textColor: "#3C1E1E" },
};

/**
 * 로고 이미지 경로를 반환
 * 실제 로고 파일이 있으면 해당 경로, 없으면 null
 */
export function getLogoSrc(centerId: string): string | null {
  // 실제 로고 파일을 사용할 기업은 여기에 추가
  // 예: if (centerId === "naver") return "/logos/naver.png";
  return null; // 현재는 모두 SVG 이니셜 사용
}

/**
 * 브랜드 정보 가져오기
 */
export function getBrandInfo(centerId: string): BrandInfo {
  return BRAND_MAP[centerId] || {
    id: centerId,
    initial: centerId.substring(0, 2).toUpperCase(),
    bgColor: "#6B7280",
    textColor: "#FFFFFF",
  };
}
