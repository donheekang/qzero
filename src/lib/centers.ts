import { CenterData, Freshness } from "./types";

// ===== 기존 고객센터 =====
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

// ===== 쇼핑/이커머스 =====
import st11 from "@/data/centers/11st.json";
import mustit from "@/data/centers/mustit.json";
import musinsa from "@/data/centers/musinsa.json";
import gmarket from "@/data/centers/gmarket.json";
import ssg from "@/data/centers/ssg.json";
import wemakeprice from "@/data/centers/wemakeprice.json";
import zigzag from "@/data/centers/zigzag.json";
import ably from "@/data/centers/ably.json";
import daangn from "@/data/centers/daangn.json";
import oliveyoung from "@/data/centers/oliveyoung.json";
import daiso from "@/data/centers/daiso.json";
import ohouse from "@/data/centers/ohouse.json";
import tmon from "@/data/centers/tmon.json";

// ===== 배달/음식 =====
import yogiyo from "@/data/centers/yogiyo.json";

// ===== 금융/핀테크 =====
import toss from "@/data/centers/toss.json";
import kakaobank from "@/data/centers/kakaobank.json";
import kbank from "@/data/centers/kbank.json";

// ===== 보험 =====
import samsunglife from "@/data/centers/samsunglife.json";
import hyundaiins from "@/data/centers/hyundaiins.json";
import dbins from "@/data/centers/dbins.json";

// ===== 항공/여행 =====
import koreanair from "@/data/centers/koreanair.json";
import asiana from "@/data/centers/asiana.json";
import yanolja from "@/data/centers/yanolja.json";
import yeogi from "@/data/centers/yeogi.json";

// ===== 택배/물류 =====
import cjlogistics from "@/data/centers/cjlogistics.json";
import hanjin from "@/data/centers/hanjin.json";
import logen from "@/data/centers/logen.json";

// ===== 전자/가전/자동차 =====
import samsung from "@/data/centers/samsung.json";
import lg from "@/data/centers/lg.json";
import apple from "@/data/centers/apple.json";
import hyundaicar from "@/data/centers/hyundaicar.json";
import kia from "@/data/centers/kia.json";

// ===== IT/엔터 =====
import netflix from "@/data/centers/netflix.json";
import disneyplus from "@/data/centers/disneyplus.json";

// ===== 공공기관 =====
import nts from "@/data/centers/nts.json";
import ei from "@/data/centers/ei.json";

// 전체 고객센터 데이터
const allCenters: CenterData[] = [
  // 통신
  skt, kt, lguplus,
  // 은행
  kbbank, shinhanbank, hanabank, wooribank, nonghyup, kakaobank, kbank, toss,
  // 카드
  samsungcard, hyundaicard, kbcard, shinhancard, lottecard,
  // 보험
  samsunglife, hyundaiins, dbins,
  // 공공
  nhis, nps, gov24, nts, ei,
  // 쇼핑/이커머스
  coupang, st11, mustit, musinsa, gmarket, ssg, wemakeprice, zigzag, ably, daangn, oliveyoung, daiso, ohouse, tmon,
  // 배달/음식
  baemin, yogiyo,
  // IT/플랫폼
  naver, kakao, netflix, disneyplus,
  // 항공/여행
  koreanair, asiana, yanolja, yeogi,
  // 택배/물류
  cjlogistics, hanjin, logen,
  // 전자/가전/자동차
  samsung, lg, apple, hyundaicar, kia,
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

  if (ratio > 0.3) return "disputed";
  if (daysSince > 30) return "stale";
  return "verified";
}

/**
 * 현재 시간대 기준 예상 대기 시간 반환
 */
export function getEstimatedWait(center: CenterData): number | null {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  if (day === 0 || day === 6) {
    return center.avg_wait.weekend;
  }
  if (hour >= 12 && hour < 13) {
    return center.avg_wait.weekday_lunch;
  }
  if (hour >= 9 && hour < 12) {
    return center.avg_wait.weekday_am;
  }
  if (hour >= 13 && hour < 18) {
    return center.avg_wait.weekday_pm;
  }
  return null;
}
