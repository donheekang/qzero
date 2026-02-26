import { CenterData, Freshness } from "./types";

// 모든 고객센터 JSON을 정적으로 import
import skt from "@/data/centers/skt.json";
import kt from "@/data/centers/kt.json";
import lguplus from "@/data/centers/lguplus.json";
import kbbank from "@/data/centers/kbbank.json";
import shinhanbank from "@/data/centers/shinhanbank.json";
import hanabank from "@/data/centers/hanabank.json";
import wooribank from "@/data/centers/wooribank.json";
import nonghyup from "@/data/centers/nonghyup.json";
import samsungcard from "@/data/centers/samsungcard.json";
import hyundaicard from "@/data/centers/hyundaicard.json";
import kbcard from "@/data/centers/kbcard.json";
import shinhancard from "@/data/centers/shinhancard.json";
import lottecard from "@/data/centers/lottecard.json";
import nhis from "@/data/centers/nhis.json";
import nps from "@/data/centers/nps.json";
import gov24 from "@/data/centers/gov24.json";
import coupang from "@/data/centers/coupang.json";
import baemin from "@/data/centers/baemin.json";
import naver from "@/data/centers/naver.json";
import kakao from "@/data/centers/kakao.json";

// 전체 고객센터 데이터
const allCenters: CenterData[] = [
  skt, kt, lguplus,
  kbbank, shinhanbank, hanabank, wooribank, nonghyup,
  samsungcard, hyundaicard, kbcard, shinhancard, lottecard,
  nhis, nps, gov24,
  coupang, baemin, naver, kakao,
] as CenterData[];

// ID로 고객센터 조회
const centerMap = new Map<string, CenterData>();
allCenters.forEach((c) => centerMap.set(c.id, c));

/**
 * 전체 고객센터 목록 반환
 */
export function getAllCenters(): CenterData[] {
  return allCenters;
}

/**
 * ID로 고객센터 조회
 */
export function getCenterById(id: string): CenterData | undefined {
  return centerMap.get(id);
}

/**
 * 카테고리별 고객센터 조회
 */
export function getCentersByCategory(category: string): CenterData[] {
  return allCenters.filter((c) => c.category === category);
}

/**
 * 인기 고객센터 목록 (홈 화면용)
 */
export function getPopularCenters(): CenterData[] {
  const popularIds = ["skt", "kbbank", "samsungcard", "coupang", "nhis", "kakao"];
  return popularIds
    .map((id) => centerMap.get(id))
    .filter((c): c is CenterData => c !== undefined);
}

/**
 * 신선도 상태 판정
 */
export function getFreshnessStatus(
  freshness: Freshness
): "verified" | "stale" | "disputed" {
  const lastVerified = new Date(freshness.last_verified);
  const now = new Date();
  const daysSince = Math.floor(
    (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24)
  );

  const ratio =
    freshness.verified_by > 0
      ? freshness.reports_incorrect / freshness.verified_by
      : 0;

  if (ratio > 0.3) return "disputed"; // 부정확 제보 30% 이상
  if (daysSince > 30) return "stale"; // 30일 이상 미검증
  return "verified";
}

/**
 * 현재 시간대 기준 예상 대기 시간 반환
 */
export function getEstimatedWait(center: CenterData): number | null {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=일, 6=토

  // 주말
  if (day === 0 || day === 6) {
    return center.avg_wait.weekend;
  }

  // 점심시간 (12~13시)
  if (hour >= 12 && hour < 13) {
    return center.avg_wait.weekday_lunch;
  }

  // 오전 (9~12시)
  if (hour >= 9 && hour < 12) {
    return center.avg_wait.weekday_am;
  }

  // 오후 (13~18시)
  if (hour >= 13 && hour < 18) {
    return center.avg_wait.weekday_pm;
  }

  // 영업시간 외
  return null;
}
