/**
 * 기업 텍스트 로고 시스템
 * 브랜드 컬러 + 이니셜 기반 - 56개 기업 전체 지원
 */

export interface BrandInfo {
  id: string;
  initial: string;
  bgColor: string;
  textColor: string;
}

export const BRAND_MAP: Record<string, BrandInfo> = {
  // ===== 통신 =====
  skt: { id: "skt", initial: "T", bgColor: "#E4002B", textColor: "#FFFFFF" },
  kt: { id: "kt", initial: "KT", bgColor: "#E52629", textColor: "#FFFFFF" },
  lguplus: { id: "lguplus", initial: "U+", bgColor: "#E6007E", textColor: "#FFFFFF" },

  // ===== 은행 =====
  kbbank: { id: "kbbank", initial: "KB", bgColor: "#FFBC00", textColor: "#4A3500" },
  shinhanbank: { id: "shinhanbank", initial: "SH", bgColor: "#0046FF", textColor: "#FFFFFF" },
  hanabank: { id: "hanabank", initial: "하나", bgColor: "#009775", textColor: "#FFFFFF" },
  wooribank: { id: "wooribank", initial: "WR", bgColor: "#0072BC", textColor: "#FFFFFF" },
  nonghyup: { id: "nonghyup", initial: "NH", bgColor: "#02A74D", textColor: "#FFFFFF" },
  kakaobank: { id: "kakaobank", initial: "Kb", bgColor: "#FEE500", textColor: "#3C1E1E" },
  kbank: { id: "kbank", initial: "K", bgColor: "#FF6F00", textColor: "#FFFFFF" },
  toss: { id: "toss", initial: "T", bgColor: "#0064FF", textColor: "#FFFFFF" },

  // ===== 카드 =====
  samsungcard: { id: "samsungcard", initial: "SS", bgColor: "#1428A0", textColor: "#FFFFFF" },
  hyundaicard: { id: "hyundaicard", initial: "HD", bgColor: "#002C5F", textColor: "#FFFFFF" },
  kbcard: { id: "kbcard", initial: "KB", bgColor: "#FFBC00", textColor: "#4A3500" },
  shinhancard: { id: "shinhancard", initial: "SH", bgColor: "#0046FF", textColor: "#FFFFFF" },
  lottecard: { id: "lottecard", initial: "LT", bgColor: "#ED1C24", textColor: "#FFFFFF" },

  // ===== 보험 =====
  samsunglife: { id: "samsunglife", initial: "SL", bgColor: "#0B4DA2", textColor: "#FFFFFF" },
  hyundaiins: { id: "hyundaiins", initial: "현해", bgColor: "#00529B", textColor: "#FFFFFF" },
  dbins: { id: "dbins", initial: "DB", bgColor: "#00A651", textColor: "#FFFFFF" },

  // ===== 공공 =====
  nhis: { id: "nhis", initial: "건보", bgColor: "#0B7B3E", textColor: "#FFFFFF" },
  nps: { id: "nps", initial: "연금", bgColor: "#0054A6", textColor: "#FFFFFF" },
  gov24: { id: "gov24", initial: "24", bgColor: "#003DA5", textColor: "#FFFFFF" },
  nts: { id: "nts", initial: "국세", bgColor: "#1A5276", textColor: "#FFFFFF" },
  ei: { id: "ei", initial: "고용", bgColor: "#2E86C1", textColor: "#FFFFFF" },

  // ===== 쇼핑/이커머스 =====
  coupang: { id: "coupang", initial: "C", bgColor: "#E31837", textColor: "#FFFFFF" },
  "11st": { id: "11st", initial: "11", bgColor: "#FF0000", textColor: "#FFFFFF" },
  mustit: { id: "mustit", initial: "MI", bgColor: "#000000", textColor: "#FFFFFF" },
  musinsa: { id: "musinsa", initial: "M", bgColor: "#000000", textColor: "#FFFFFF" },
  gmarket: { id: "gmarket", initial: "G", bgColor: "#00A651", textColor: "#FFFFFF" },
  ssg: { id: "ssg", initial: "SSG", bgColor: "#FF4E50", textColor: "#FFFFFF" },
  wemakeprice: { id: "wemakeprice", initial: "위", bgColor: "#FF4081", textColor: "#FFFFFF" },
  tmon: { id: "tmon", initial: "TM", bgColor: "#FF4444", textColor: "#FFFFFF" },
  zigzag: { id: "zigzag", initial: "ZZ", bgColor: "#FF2D78", textColor: "#FFFFFF" },
  ably: { id: "ably", initial: "A", bgColor: "#FF2E6E", textColor: "#FFFFFF" },
  daangn: { id: "daangn", initial: "당", bgColor: "#FF6F0F", textColor: "#FFFFFF" },
  oliveyoung: { id: "oliveyoung", initial: "OY", bgColor: "#00A862", textColor: "#FFFFFF" },
  daiso: { id: "daiso", initial: "D", bgColor: "#E60012", textColor: "#FFFFFF" },
  ohouse: { id: "ohouse", initial: "오", bgColor: "#35C5F0", textColor: "#FFFFFF" },

  // ===== 배달/음식 =====
  baemin: { id: "baemin", initial: "배", bgColor: "#2AC1BC", textColor: "#FFFFFF" },
  yogiyo: { id: "yogiyo", initial: "요", bgColor: "#FA0050", textColor: "#FFFFFF" },

  // ===== IT/플랫폼 =====
  naver: { id: "naver", initial: "N", bgColor: "#03C75A", textColor: "#FFFFFF" },
  kakao: { id: "kakao", initial: "K", bgColor: "#FEE500", textColor: "#3C1E1E" },
  netflix: { id: "netflix", initial: "N", bgColor: "#E50914", textColor: "#FFFFFF" },
  disneyplus: { id: "disneyplus", initial: "D+", bgColor: "#113CCF", textColor: "#FFFFFF" },

  // ===== 항공/여행 =====
  koreanair: { id: "koreanair", initial: "KE", bgColor: "#00256C", textColor: "#FFFFFF" },
  asiana: { id: "asiana", initial: "OZ", bgColor: "#C4001A", textColor: "#FFFFFF" },
  yanolja: { id: "yanolja", initial: "야", bgColor: "#FF014E", textColor: "#FFFFFF" },
  yeogi: { id: "yeogi", initial: "여", bgColor: "#5C3EC2", textColor: "#FFFFFF" },

  // ===== 택배/물류 =====
  cjlogistics: { id: "cjlogistics", initial: "CJ", bgColor: "#E4002B", textColor: "#FFFFFF" },
  hanjin: { id: "hanjin", initial: "한진", bgColor: "#003478", textColor: "#FFFFFF" },
  logen: { id: "logen", initial: "로젠", bgColor: "#004098", textColor: "#FFFFFF" },

  // ===== 전자/가전/자동차 =====
  samsung: { id: "samsung", initial: "SS", bgColor: "#1428A0", textColor: "#FFFFFF" },
  lg: { id: "lg", initial: "LG", bgColor: "#A50034", textColor: "#FFFFFF" },
  apple: { id: "apple", initial: "A", bgColor: "#000000", textColor: "#FFFFFF" },
  hyundaicar: { id: "hyundaicar", initial: "H", bgColor: "#002C5F", textColor: "#FFFFFF" },
  kia: { id: "kia", initial: "KIA", bgColor: "#05141F", textColor: "#FFFFFF" },
};

/**
 * 로고 이미지 경로 (텍스트 로고만 사용하므로 항상 null)
 */
export function getLogoSrc(): string | null {
  return null;
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
