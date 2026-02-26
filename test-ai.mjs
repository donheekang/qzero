/**
 * AI 모듈 구조 테스트 (API 호출 없이 로직만 검증)
 * 실행: node test-ai.mjs
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// AI 모듈에서 export하는 함수들의 존재 여부 확인 (소스 코드 파싱)
const aiSource = readFileSync(join(__dirname, "src/lib/ai.ts"), "utf-8");
const premiumSource = readFileSync(join(__dirname, "src/lib/premium.ts"), "utf-8");
const apiSource = readFileSync(join(__dirname, "src/app/api/ai/route.ts"), "utf-8");

console.log("=== Qzero AI 모듈 구조 테스트 ===\n");

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    failed++;
  }
}

// === lib/ai.ts 검증 ===
console.log("📁 lib/ai.ts");
check("PremiumFeatureType 타입 정의", aiSource.includes("PremiumFeatureType"));
check("callClaudeAPI 함수 존재", aiSource.includes("export async function callClaudeAPI"));
check("analyzeIntent 함수 존재", aiSource.includes("export async function analyzeIntent"));
check("generateScript 함수 존재", aiSource.includes("export async function generateScript"));
check("getCancellationCoaching 함수 존재", aiSource.includes("export async function getCancellationCoaching"));
check("draftComplaint 함수 존재", aiSource.includes("export async function draftComplaint"));
check("resolveComplex 함수 존재", aiSource.includes("export async function resolveComplex"));
check("getPremiumPreview 함수 존재", aiSource.includes("export function getPremiumPreview"));

// 프롬프트 검증
check("intent_analysis 프롬프트 정의", aiSource.includes("intent_analysis:"));
check("custom_script 프롬프트 정의", aiSource.includes("custom_script:"));
check("cancellation_coaching 프롬프트 정의", aiSource.includes("cancellation_coaching:"));
check("complaint_draft 프롬프트 정의", aiSource.includes("complaint_draft:"));
check("complex_resolution 프롬프트 정의", aiSource.includes("complex_resolution:"));

// 법적 근거 포함 확인
check("소비자보호법 근거 포함", aiSource.includes("소비자기본법") || aiSource.includes("소비자보호법"));
check("공정거래위원회 안내 포함", aiSource.includes("공정거래위원회"));
check("금융감독원 안내 포함 (카드/은행)", aiSource.includes("금융감독원"));

// API 키 체크 로직
check("API 키 미설정 처리", aiSource.includes("ANTHROPIC_API_KEY"));
check("에러 핸들링 존재", aiSource.includes("catch"));

console.log("\n📁 lib/premium.ts");
check("checkPremiumStatus 함수 존재", premiumSource.includes("export function checkPremiumStatus"));
check("canUsePremiumFeature 함수 존재", premiumSource.includes("export function canUsePremiumFeature"));
check("PREMIUM_PLANS 정의", premiumSource.includes("PREMIUM_PLANS"));
check("월 2,900원 가격 설정", premiumSource.includes("2900"));
check("getUpsellCards 함수 존재", premiumSource.includes("export function getUpsellCards"));
check("일일 사용 한도 체크", premiumSource.includes("dailyAILimit") && premiumSource.includes("dailyAIUsage"));

console.log("\n📁 app/api/ai/route.ts");
check("POST 핸들러 존재", apiSource.includes("export async function POST"));
check("프리미엄 상태 체크", apiSource.includes("checkPremiumStatus"));
check("잠금 상태 반환 (locked)", apiSource.includes("locked: true"));
check("미리보기 반환 (preview)", apiSource.includes("preview"));
check("입력 검증", apiSource.includes("status: 400"));
check("에러 핸들링", apiSource.includes("status: 500"));

console.log(`\n=== 결과: ${passed}/${passed + failed} 통과 (${Math.round(passed/(passed+failed)*100)}%) ===`);
if (failed > 0) {
  console.log(`⚠️ ${failed}개 실패`);
} else {
  console.log("🎉 모든 구조 테스트 통과!");
}
