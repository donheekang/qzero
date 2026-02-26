/**
 * 키워드 매칭 엔진 테스트 (Node.js로 직접 실행)
 * 실행: node test-matcher.mjs
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ===== JSON 데이터 로드 =====
const centersDir = join(__dirname, "src/data/centers");
const centerFiles = [
  "skt", "kt", "lguplus",
  "kbbank", "shinhanbank", "hanabank", "wooribank", "nonghyup",
  "samsungcard", "hyundaicard", "kbcard", "shinhancard", "lottecard",
  "nhis", "nps", "gov24",
  "coupang", "baemin", "naver", "kakao"
];

const allCenters = centerFiles.map(f =>
  JSON.parse(readFileSync(join(centersDir, `${f}.json`), "utf-8"))
);

const centerMap = new Map();
allCenters.forEach(c => centerMap.set(c.id, c));

// ===== 동의어 매핑 (matcher.ts에서 복사) =====
const COMPANY_SYNONYMS = [
  { id: "skt", synonyms: ["skt", "sk텔레콤", "sk telecom", "에스케이티", "에스케이텔레콤", "sk", "에스케이", "티월드"] },
  { id: "kt", synonyms: ["kt", "케이티", "올레", "olleh"] },
  { id: "lguplus", synonyms: ["lg u+", "lgu+", "lg유플러스", "유플러스", "엘지", "lg"] },
  { id: "kbbank", synonyms: ["국민은행", "kb국민은행", "kb은행", "kb", "국민"] },
  { id: "shinhanbank", synonyms: ["신한은행", "shinhan", "신한", "쏠뱅크"] },
  { id: "hanabank", synonyms: ["하나은행", "hana", "하나", "하나원큐"] },
  { id: "wooribank", synonyms: ["우리은행", "woori", "우리", "원뱅킹"] },
  { id: "nonghyup", synonyms: ["농협", "nh농협", "농협은행", "nh", "올원뱅크"] },
  { id: "samsungcard", synonyms: ["삼성카드", "samsung card", "삼성"] },
  { id: "hyundaicard", synonyms: ["현대카드", "hyundai card", "현대", "m포인트"] },
  { id: "kbcard", synonyms: ["kb카드", "국민카드", "kb국민카드", "kb pay"] },
  { id: "shinhancard", synonyms: ["신한카드", "shinhan card", "sol페이"] },
  { id: "lottecard", synonyms: ["롯데카드", "lotte card", "l.point", "엘포인트"] },
  { id: "nhis", synonyms: ["건강보험", "국민건강보험", "nhis", "건보", "의료보험"] },
  { id: "nps", synonyms: ["국민연금", "연금", "nps", "연금공단"] },
  { id: "gov24", synonyms: ["정부24", "gov24", "정부", "주민센터", "주민등록", "증명서", "110"] },
  { id: "coupang", synonyms: ["쿠팡", "coupang", "로켓배송", "로켓와우"] },
  { id: "baemin", synonyms: ["배달의민족", "배민", "baemin", "배달"] },
  { id: "naver", synonyms: ["네이버", "naver", "네이버페이"] },
  { id: "kakao", synonyms: ["카카오", "kakao", "카카오톡", "카톡", "카카오페이"] },
];

const PURPOSE_KEYWORDS = [
  { category: "해지", keywords: ["해지", "탈퇴", "해약", "취소", "그만", "끊으"], needsPremium: false },
  { category: "요금문의", keywords: ["요금", "비용", "얼마", "금액", "청구", "납부", "결제"], needsPremium: false },
  { category: "요금제변경", keywords: ["요금제", "플랜", "변경", "바꾸"], needsPremium: false },
  { category: "환불", keywords: ["환불", "돌려", "반환"], needsPremium: false },
  { category: "반품", keywords: ["반품", "교환", "반송"], needsPremium: false },
  { category: "배송", keywords: ["배송", "택배", "도착"], needsPremium: false },
  { category: "분실", keywords: ["분실", "잃어", "도난"], needsPremium: false },
  { category: "장애", keywords: ["장애", "안됨", "안돼", "오류", "에러", "먹통", "안되", "고장"], needsPremium: false },
  { category: "한도", keywords: ["한도", "한도변경", "한도상향", "한도올리"], needsPremium: false },
  { category: "보험료", keywords: ["보험료", "보험", "보험금", "보험료조회"], needsPremium: false },
  { category: "연금", keywords: ["연금", "수령", "수급"], needsPremium: false },
  { category: "대출", keywords: ["대출", "론", "빌리", "대출금리", "대출상담"], needsPremium: false },
  { category: "증명서", keywords: ["증명서", "등본", "초본", "발급", "가족관계"], needsPremium: false },
  { category: "포인트", keywords: ["포인트", "적립", "마일리지"], needsPremium: false },
  { category: "상담원연결", keywords: ["상담원", "상담사", "사람", "연결", "전화"], needsPremium: false },
  { category: "상담멘트", keywords: ["뭐라고 말", "어떻게 말", "멘트", "스크립트"], needsPremium: true },
  { category: "해지방어", keywords: ["유지팀", "방어", "협상", "할인받"], needsPremium: true },
  { category: "민원대필", keywords: ["민원", "항의", "소비자보호", "공정거래", "신고"], needsPremium: true },
];

// ===== 간단한 매칭 로직 =====
function normalize(text) {
  return text.toLowerCase().replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣+.]/g, " ").replace(/\s+/g, " ").trim();
}

function extractCompany(query) {
  const normalized = normalize(query);
  let best = null;
  for (const entry of COMPANY_SYNONYMS) {
    const sorted = [...entry.synonyms].sort((a, b) => b.length - a.length);
    for (const synonym of sorted) {
      const ns = normalize(synonym);
      if (normalized.includes(ns)) {
        if (!best || ns.length > best.synonymLength) {
          best = { id: entry.id, name: centerMap.get(entry.id)?.name || entry.id, synonymLength: ns.length };
        }
      }
    }
  }
  return best;
}

function extractPurpose(query) {
  const normalized = normalize(query);
  let best = null;
  for (const entry of PURPOSE_KEYWORDS) {
    for (const kw of entry.keywords) {
      if (normalized.includes(kw)) {
        if (!best || kw.length > best.keyword.length) {
          best = { category: entry.category, keyword: kw, needsPremium: entry.needsPremium };
        }
      }
    }
  }
  return best;
}

// ===== 테스트 케이스 =====
const testCases = [
  // 기업명 + 목적 조합
  { query: "SKT 해지", expectCompany: "skt", expectPurpose: "해지" },
  { query: "에스케이텔레콤 요금제 변경", expectCompany: "skt", expectPurpose: "요금제변경" },
  { query: "국민은행 잔액 조회", expectCompany: "kbbank", expectPurpose: null },
  { query: "삼성카드 한도 올리고 싶어요", expectCompany: "samsungcard", expectPurpose: "한도" },
  { query: "쿠팡 반품하고 싶어요", expectCompany: "coupang", expectPurpose: "반품" },
  { query: "배민 환불", expectCompany: "baemin", expectPurpose: "환불" },
  { query: "카카오톡 비밀번호 분실", expectCompany: "kakao", expectPurpose: "분실" },
  { query: "건강보험 보험료 조회", expectCompany: "nhis", expectPurpose: "보험료" },
  { query: "정부24 주민등록등본 발급", expectCompany: "gov24", expectPurpose: "증명서" },
  { query: "네이버 로그인 안돼", expectCompany: "naver", expectPurpose: "장애" },
  { query: "현대카드 포인트 조회", expectCompany: "hyundaicard", expectPurpose: null },
  { query: "하나은행 대출 상담", expectCompany: "hanabank", expectPurpose: "대출" },
  { query: "LG U+ 인터넷 장애", expectCompany: "lguplus", expectPurpose: "장애" },

  // 동의어 테스트
  { query: "케이티 요금 비싸", expectCompany: "kt", expectPurpose: "요금문의" },
  { query: "유플러스 해지하려고", expectCompany: "lguplus", expectPurpose: "해지" },
  { query: "농협 이체", expectCompany: "nonghyup", expectPurpose: null },
  { query: "롯데카드 분실신고", expectCompany: "lottecard", expectPurpose: "분실" },

  // 프리미엄 기능 (needsPremium)
  { query: "SKT 해지할 때 뭐라고 말해야 해?", expectCompany: "skt", expectPurpose: "상담멘트", expectPremium: true },
  { query: "유지팀 방어 팁", expectCompany: null, expectPurpose: "해지방어", expectPremium: true },
  { query: "쿠팡 민원 넣고 싶어", expectCompany: "coupang", expectPurpose: "민원대필", expectPremium: true },

  // 매칭 실패 케이스
  { query: "폰 요금 너무 비싸", expectCompany: null, expectPurpose: "요금문의" },
  { query: "인터넷이 느려요", expectCompany: null, expectPurpose: null },
];

// ===== 테스트 실행 =====
console.log("=== Qzero 키워드 매칭 엔진 테스트 ===\n");

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const company = extractCompany(tc.query);
  const purpose = extractPurpose(tc.query);

  const companyOk = (company?.id || null) === tc.expectCompany;
  const purposeOk = !tc.expectPurpose || (purpose?.category === tc.expectPurpose);
  const premiumOk = tc.expectPremium === undefined || purpose?.needsPremium === tc.expectPremium;

  const ok = companyOk && purposeOk && premiumOk;

  if (ok) {
    passed++;
    console.log(`✅ "${tc.query}"`);
    console.log(`   기업: ${company?.name || "(없음)"} | 목적: ${purpose?.category || "(없음)"}${purpose?.needsPremium ? " 🔒프리미엄" : ""}`);
  } else {
    failed++;
    console.log(`❌ "${tc.query}"`);
    console.log(`   기대: 기업=${tc.expectCompany}, 목적=${tc.expectPurpose}`);
    console.log(`   실제: 기업=${company?.id || null}, 목적=${purpose?.category || null}`);
  }
  console.log();
}

console.log(`\n=== 결과: ${passed}/${passed + failed} 통과 (${Math.round(passed/(passed+failed)*100)}%) ===`);

if (failed > 0) {
  console.log(`⚠️ ${failed}개 실패`);
} else {
  console.log("🎉 모든 테스트 통과!");
}
