/**
 * Qzero 키워드 매칭 엔진 (무료 티어)
 *
 * 사용자 입력에서:
 * 1. 기업명 추출 (동의어 매핑 포함)
 * 2. 목적 키워드 추출
 * 3. DB에서 매칭되는 해결법 반환
 * 4. 매칭 실패 시 → 프리미엄(LLM) 유도
 */

import { CenterData, SearchResult, Solution, MatchResult } from "./types";
import { getAllCenters, getCenterById, getEstimatedWait } from "./centers";

// ===== 1. 기업명 동의어 매핑 =====

interface SynonymEntry {
  id: string;
  synonyms: string[];
}

const COMPANY_SYNONYMS: SynonymEntry[] = [
  // 통신
  { id: "skt", synonyms: ["skt", "sk텔레콤", "sk telecom", "에스케이티", "에스케이텔레콤", "sk", "에스케이", "티월드"] },
  { id: "kt", synonyms: ["kt", "케이티", "올레", "olleh", "케이티텔레콤"] },
  { id: "lguplus", synonyms: ["lg u+", "lgu+", "lg유플러스", "엘지유플러스", "유플러스", "lguplus", "엘지", "lg"] },

  // 은행
  { id: "kbbank", synonyms: ["국민은행", "kb국민은행", "kb은행", "kbbank", "kb", "국민", "케이비은행"] },
  { id: "shinhanbank", synonyms: ["신한은행", "shinhan", "신한", "쏠뱅크", "sol뱅크"] },
  { id: "hanabank", synonyms: ["하나은행", "hana", "하나", "하나원큐", "kebhana"] },
  { id: "wooribank", synonyms: ["우리은행", "woori", "우리", "원뱅킹", "won뱅킹"] },
  { id: "nonghyup", synonyms: ["농협", "nh농협", "농협은행", "nonghyup", "nh", "올원뱅크", "엔에이치"] },

  // 카드
  { id: "samsungcard", synonyms: ["삼성카드", "samsung card", "삼성", "samsungcard"] },
  { id: "hyundaicard", synonyms: ["현대카드", "hyundai card", "현대", "hyundaicard", "m포인트"] },
  { id: "kbcard", synonyms: ["kb카드", "국민카드", "kb국민카드", "kbcard", "kb pay", "케이비카드"] },
  { id: "shinhancard", synonyms: ["신한카드", "shinhan card", "shinhancard", "sol페이"] },
  { id: "lottecard", synonyms: ["롯데카드", "lotte card", "lottecard", "l.point", "엘포인트"] },

  // 공공
  { id: "nhis", synonyms: ["건강보험", "국민건강보험", "nhis", "건보", "건강보험공단", "의료보험"] },
  { id: "nps", synonyms: ["국민연금", "연금", "nps", "국민연금공단", "연금공단"] },
  { id: "gov24", synonyms: ["정부24", "gov24", "정부", "주민센터", "주민등록", "증명서", "정부민원", "110"] },

  // 기타
  { id: "coupang", synonyms: ["쿠팡", "coupang", "로켓배송", "로켓와우", "쿠팡와우"] },
  { id: "baemin", synonyms: ["배달의민족", "배민", "baemin", "배달", "우아한형제들"] },
  { id: "naver", synonyms: ["네이버", "naver", "네이버페이", "네이버쇼핑", "네이버블로그"] },
  { id: "kakao", synonyms: ["카카오", "kakao", "카카오톡", "카톡", "카카오페이", "카카오택시", "카카오뱅크"] },
];

// ===== 2. 목적(의도) 키워드 매핑 =====

interface PurposeEntry {
  category: string;       // 목적 카테고리
  keywords: string[];     // 매칭 키워드
  needsPremium: boolean;  // 프리미엄 필요 여부
}

const PURPOSE_KEYWORDS: PurposeEntry[] = [
  // === 무료 기능 ===
  { category: "해지", keywords: ["해지", "탈퇴", "해약", "취소", "그만", "끊으", "끊고"], needsPremium: false },
  { category: "요금문의", keywords: ["요금", "비용", "얼마", "금액", "청구", "납부", "결제", "미납"], needsPremium: false },
  { category: "요금제변경", keywords: ["요금제", "플랜", "변경", "바꾸", "전환"], needsPremium: false },
  { category: "환불", keywords: ["환불", "돌려", "반환", "취소"], needsPremium: false },
  { category: "반품", keywords: ["반품", "교환", "반송"], needsPremium: false },
  { category: "배송", keywords: ["배송", "택배", "도착", "배달", "수령"], needsPremium: false },
  { category: "분실", keywords: ["분실", "잃어", "도난", "훔", "잃었"], needsPremium: false },
  { category: "장애", keywords: ["장애", "안됨", "안돼", "오류", "에러", "먹통", "안되", "고장", "불량"], needsPremium: false },
  { category: "비밀번호", keywords: ["비밀번호", "비번", "패스워드", "잠금", "로그인"], needsPremium: false },
  { category: "한도", keywords: ["한도", "한도변경", "한도상향", "한도조회", "한도올리", "한도늘리"], needsPremium: false },
  { category: "잔액조회", keywords: ["잔액", "잔고", "얼마남", "조회"], needsPremium: false },
  { category: "이체", keywords: ["이체", "송금", "보내"], needsPremium: false },
  { category: "대출", keywords: ["대출", "론", "빌리", "대출금리", "대출상담"], needsPremium: false },
  { category: "보험료", keywords: ["보험료", "보험", "보험금", "보험료조회"], needsPremium: false },
  { category: "연금", keywords: ["연금", "수령", "수급"], needsPremium: false },
  { category: "증명서", keywords: ["증명서", "등본", "초본", "발급", "가족관계"], needsPremium: false },
  { category: "포인트", keywords: ["포인트", "적립", "마일리지"], needsPremium: false },
  { category: "상담원연결", keywords: ["상담원", "상담사", "사람", "연결", "전화"], needsPremium: false },

  // === 프리미엄 기능 ===
  { category: "상담멘트", keywords: ["뭐라고 말", "어떻게 말", "멘트", "대사", "스크립트"], needsPremium: true },
  { category: "해지방어", keywords: ["유지팀", "방어", "협상", "할인받", "할인 제안"], needsPremium: true },
  { category: "민원대필", keywords: ["민원", "항의", "소비자보호", "공정거래", "신고", "불만접수", "피해"], needsPremium: true },
  { category: "복합문제", keywords: ["그리고", "동시에", "둘 다", "여러개", "같이"], needsPremium: true },
];

// ===== 3. 매칭 함수들 =====

/**
 * 텍스트 정규화 (소문자, 공백 정리)
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣+.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 기업명 추출
 */
function extractCompany(query: string): { id: string; name: string; confidence: number } | null {
  const normalized = normalize(query);

  // 정확한 매칭 먼저 시도 (긴 동의어부터)
  let bestMatch: { id: string; synonym: string; confidence: number } | null = null;

  for (const entry of COMPANY_SYNONYMS) {
    // 긴 동의어부터 매칭 (더 정확)
    const sorted = [...entry.synonyms].sort((a, b) => b.length - a.length);
    for (const synonym of sorted) {
      const normalizedSynonym = normalize(synonym);
      if (normalized.includes(normalizedSynonym)) {
        const confidence = normalizedSynonym.length >= 3 ? 1.0 : 0.8;
        if (!bestMatch || confidence > bestMatch.confidence || normalizedSynonym.length > bestMatch.synonym.length) {
          bestMatch = { id: entry.id, synonym: normalizedSynonym, confidence };
        }
      }
    }
  }

  if (bestMatch) {
    const center = getCenterById(bestMatch.id);
    return {
      id: bestMatch.id,
      name: center?.name || bestMatch.id,
      confidence: bestMatch.confidence,
    };
  }

  return null;
}

/**
 * 목적(의도) 추출
 */
function extractPurpose(query: string): {
  category: string;
  keyword: string;
  needsPremium: boolean;
  confidence: number;
} | null {
  const normalized = normalize(query);

  let bestMatch: {
    category: string;
    keyword: string;
    needsPremium: boolean;
    confidence: number;
  } | null = null;

  for (const entry of PURPOSE_KEYWORDS) {
    for (const keyword of entry.keywords) {
      if (normalized.includes(keyword)) {
        const confidence = keyword.length >= 3 ? 0.9 : 0.7;
        if (!bestMatch || confidence > bestMatch.confidence || keyword.length > bestMatch.keyword.length) {
          bestMatch = {
            category: entry.category,
            keyword,
            needsPremium: entry.needsPremium,
            confidence,
          };
        }
      }
    }
  }

  return bestMatch;
}

/**
 * 해결법(Solution) 생성
 */
function buildSolution(center: CenterData, purposeCategory: string | null): Solution | null {
  if (!purposeCategory) return null;

  // 1. 전화 없이 해결 가능한지 확인 (대안 채널)
  const relevantAlts = center.alternatives.filter((alt) =>
    alt.solves.some((s) => {
      const normalizedSolve = normalize(s);
      const normalizedPurpose = normalize(purposeCategory);
      return normalizedSolve.includes(normalizedPurpose) || normalizedPurpose.includes(normalizedSolve);
    })
  );

  // 2. ARS 최단 경로 확인
  const shortcutKey = Object.keys(center.shortcuts).find((key) => {
    const normalizedKey = normalize(key);
    const normalizedPurpose = normalize(purposeCategory);
    return normalizedKey.includes(normalizedPurpose) || normalizedPurpose.includes(normalizedKey);
  });
  const arsPath = shortcutKey ? center.shortcuts[shortcutKey] : center.shortcuts["상담원연결"] || "0";

  // 3. 예상 대기 시간
  const estimatedWait = getEstimatedWait(center);

  // 앱/웹으로 해결 가능한 경우
  if (relevantAlts.length > 0) {
    const bestAlt = relevantAlts.find((a) => a.type === "app") || relevantAlts[0];
    return {
      type: "both",
      title: "전화 안 해도 돼요!",
      description: `${bestAlt.name}에서 바로 해결할 수 있어요.`,
      steps: bestAlt.path ? bestAlt.path.split(" > ") : undefined,
      arsPath,
      alternative: bestAlt,
      estimatedWait,
      bestTime: findBestCallTime(center),
    };
  }

  // 전화만 가능한 경우
  return {
    type: "call",
    title: "전화로 해결할 수 있어요",
    description: `${center.name} 고객센터에 전화해주세요.`,
    arsPath,
    estimatedWait,
    bestTime: findBestCallTime(center),
  };
}

/**
 * 최적 통화 시간 추천
 */
function findBestCallTime(center: CenterData): string {
  const { weekday_am, weekday_pm, weekday_lunch } = center.avg_wait;

  if (weekday_am === null && weekday_pm === null) {
    return "운영시간을 확인해주세요";
  }

  const times: { label: string; wait: number }[] = [];
  if (weekday_am !== null) times.push({ label: "평일 오전 9~10시", wait: weekday_am });
  if (weekday_pm !== null) times.push({ label: "평일 오후 2~4시", wait: weekday_pm });
  if (weekday_lunch !== null) times.push({ label: "점심시간", wait: weekday_lunch });

  times.sort((a, b) => a.wait - b.wait);

  if (times.length > 0) {
    return `${times[0].label}이 대기 약 ${times[0].wait}분으로 가장 빨라요`;
  }

  return "오전 시간대가 비교적 한산해요";
}

// ===== 4. 메인 검색 함수 =====

/**
 * 사용자 쿼리를 분석하여 매칭 결과 반환
 */
export function analyzeQuery(query: string): MatchResult {
  const company = extractCompany(query);
  const purpose = extractPurpose(query);

  return {
    centerId: company?.id || null,
    centerName: company?.name || null,
    purpose: purpose?.category || null,
    purposeCategory: purpose?.category || null,
    confidence: Math.min(company?.confidence || 0, purpose?.confidence || 0) || (company?.confidence || 0),
    needsPremium: purpose?.needsPremium || false,
    rawQuery: query,
  };
}

/**
 * 전체 검색 파이프라인
 * 1. 쿼리 분석
 * 2. 기업 매칭
 * 3. 해결법 생성
 * 4. 프리미엄 필요 여부 판단
 */
export function search(query: string): SearchResult[] {
  const analysis = analyzeQuery(query);
  const results: SearchResult[] = [];

  // 기업명이 매칭된 경우
  if (analysis.centerId) {
    const center = getCenterById(analysis.centerId);
    if (center) {
      const solution = buildSolution(center, analysis.purpose);
      results.push({
        center,
        matchType: "exact",
        matchedKeyword: analysis.centerName || "",
        purpose: analysis.purpose,
        solution,
        confidence: analysis.confidence,
      });
    }
  }

  // 기업명 매칭 실패 → 키워드로 전체 DB 검색
  if (results.length === 0) {
    const normalized = normalize(query);
    const allCenters = getAllCenters();

    for (const center of allCenters) {
      // keywords 배열에서 매칭
      const matchedKeyword = center.keywords.find((kw) =>
        normalized.includes(normalize(kw))
      );

      if (matchedKeyword) {
        const solution = buildSolution(center, analysis.purpose);
        results.push({
          center,
          matchType: "keyword",
          matchedKeyword,
          purpose: analysis.purpose,
          solution,
          confidence: 0.6,
        });
      }
    }
  }

  // 그래도 없으면 → 목적 카테고리만으로 관련 센터 추천
  if (results.length === 0 && analysis.purpose) {
    const allCenters = getAllCenters();
    for (const center of allCenters) {
      // shortcuts에 해당 목적이 있는 센터 찾기
      const hasShortcut = Object.keys(center.shortcuts).some(
        (key) => normalize(key).includes(normalize(analysis.purpose || ""))
      );
      // alternatives에서 해당 목적을 해결하는 센터 찾기
      const hasAlt = center.alternatives.some((alt) =>
        alt.solves.some((s) => normalize(s).includes(normalize(analysis.purpose || "")))
      );

      if (hasShortcut || hasAlt) {
        const solution = buildSolution(center, analysis.purpose);
        results.push({
          center,
          matchType: "fuzzy",
          matchedKeyword: analysis.purpose || "",
          purpose: analysis.purpose,
          solution,
          confidence: 0.3,
        });
      }
    }
  }

  // 신뢰도 순으로 정렬
  results.sort((a, b) => b.confidence - a.confidence);

  return results;
}

/**
 * 프리미엄 기능 필요 여부 확인
 */
export function needsPremiumFeature(query: string): boolean {
  const analysis = analyzeQuery(query);
  return analysis.needsPremium;
}

/**
 * 자동완성용 기업명 검색
 */
export function suggestCompanies(partial: string): { id: string; name: string }[] {
  const normalized = normalize(partial);
  if (normalized.length < 1) return [];

  const suggestions: { id: string; name: string; priority: number }[] = [];

  for (const entry of COMPANY_SYNONYMS) {
    for (const synonym of entry.synonyms) {
      if (normalize(synonym).startsWith(normalized) || normalized.startsWith(normalize(synonym))) {
        const center = getCenterById(entry.id);
        suggestions.push({
          id: entry.id,
          name: center?.name || entry.id,
          priority: normalize(synonym).startsWith(normalized) ? 1 : 2,
        });
        break; // 동일 기업 중복 방지
      }
    }
  }

  return suggestions
    .sort((a, b) => a.priority - b.priority)
    .map(({ id, name }) => ({ id, name }));
}
