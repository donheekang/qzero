// ===== 고객센터 데이터 타입 =====

export interface ArsNode {
  label?: string;
  sub?: Record<string, ArsNode | string>;
}

export type ArsTree = Record<string, ArsNode | string>;

export interface Alternative {
  type: "app" | "chat" | "web";
  name: string;
  path?: string;
  url?: string | null;
  solves: string[];
}

export interface AvgWait {
  weekday_am: number | null;
  weekday_pm: number | null;
  weekday_lunch: number | null;
  weekend: number | null;
}

export interface Freshness {
  last_verified: string;
  verified_by: number;
  reports_incorrect: number;
  status: "verified" | "stale" | "disputed" | "unverified";
}

export interface UpdateRecord {
  date: string;
  field: string;
  old_value: string;
  new_value: string;
  source: "user_report" | "crawl" | "admin";
  verified_count: number;
  reporter_memo?: string;
}

export interface CenterData {
  id: string;
  name: string;
  category: string;
  tel: string | null;
  tel_short: string | null;
  hours: string;
  ars_tree: ArsTree;
  shortcuts: Record<string, string>;
  alternatives: Alternative[];
  avg_wait: AvgWait;
  tips: string[];
  satisfaction: number;
  last_updated: string;
  verified_by_users: number;
  freshness: Freshness;
  update_history: UpdateRecord[];
  keywords: string[];
}

// ===== 검색 결과 타입 =====

export interface SearchResult {
  center: CenterData;
  matchType: "exact" | "keyword" | "fuzzy";
  matchedKeyword: string;
  purpose: string | null;
  solution: Solution | null;
  confidence: number; // 0~1
}

export interface Solution {
  type: "no_call" | "call" | "both";
  title: string;
  description: string;
  steps?: string[];
  arsPath?: string;
  alternative?: Alternative;
  estimatedWait?: number | null;
  bestTime?: string;
}

// ===== 프리미엄 기능 타입 =====

export interface PremiumFeature {
  type: "script" | "coaching" | "complaint" | "complex";
  title: string;
  preview: string; // 미리보기 (블러 처리될 내용)
  locked: boolean;
}

// ===== 매칭 엔진 타입 =====

export interface MatchResult {
  centerId: string | null;
  centerName: string | null;
  purpose: string | null;
  purposeCategory: string | null;
  confidence: number;
  needsPremium: boolean;
  rawQuery: string;
}
