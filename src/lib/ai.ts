/**
 * Qzero 프리미엄 AI 기능 (Claude API)
 *
 * 기능:
 * 1. 자연어 의도 분석 (키워드 매칭 실패 시 폴백)
 * 2. 맞춤 상담 멘트 생성
 * 3. 해지 방어 코칭 (유지팀 대응 시뮬레이션)
 * 4. 민원 대필 (소비자보호법 근거 포함)
 * 5. 복합 문제 해결 (여러 기업 동시 안내)
 */

import { CenterData } from "./types";

// ===== 타입 정의 =====

export type PremiumFeatureType =
  | "intent_analysis"
  | "custom_script"
  | "cancellation_coaching"
  | "complaint_draft"
  | "complex_resolution";

export interface AIRequest {
  type: PremiumFeatureType;
  query: string;
  center?: CenterData;
  context?: Record<string, unknown>;
}

export interface AIResponse {
  success: boolean;
  type: PremiumFeatureType;
  content: string;
  structured?: Record<string, unknown>;
  tokensUsed?: number;
}

// ===== 시스템 프롬프트 =====

const SYSTEM_PROMPT = `당신은 Qzero의 AI 어시스턴트입니다. 한국의 고객센터 문제를 빠르고 정확하게 해결하는 것이 목표입니다.

핵심 원칙:
- 항상 한국어로 답변합니다
- 실용적이고 구체적인 조언을 제공합니다
- 법적 근거가 있을 때는 관련 법률을 인용합니다
- 사용자 편에서 최대한 유리한 방향으로 안내합니다
- 답변은 간결하되 필요한 정보는 빠짐없이 포함합니다`;

// ===== 기능별 프롬프트 =====

const PROMPTS: Record<PremiumFeatureType, (query: string, center?: CenterData) => string> = {
  /**
   * 1. 자연어 의도 분석
   * 키워드 매칭 실패 시 LLM이 의도를 파악
   */
  intent_analysis: (query: string) => `
사용자가 고객센터 관련 문의를 했습니다. 이 문의를 분석해주세요.

사용자 입력: "${query}"

다음 JSON 형식으로 분석 결과를 반환해주세요:
{
  "company": "추정 기업명 (확실하지 않으면 null)",
  "company_id": "기업 ID (skt, kt, lguplus, kbbank, shinhanbank, hanabank, wooribank, nonghyup, samsungcard, hyundaicard, kbcard, shinhancard, lottecard, nhis, nps, gov24, coupang, baemin, naver, kakao 중 하나, 없으면 null)",
  "purpose": "사용자의 목적 (해지, 요금문의, 환불, 반품 등)",
  "urgency": "긴급도 (high/medium/low)",
  "summary": "문제 요약 (한 줄)"
}

JSON만 반환하세요. 다른 텍스트는 포함하지 마세요.`,

  /**
   * 2. 맞춤 상담 멘트 생성
   */
  custom_script: (query: string, center?: CenterData) => `
사용자가 ${center?.name || "고객센터"}에 전화할 때 사용할 상담 멘트를 만들어주세요.

사용자 상황: "${query}"
${center ? `기업: ${center.name}
전화번호: ${center.tel || "없음"}
ARS 최단경로: ${JSON.stringify(center.shortcuts)}` : ""}

다음 형식으로 답변해주세요:

📞 상담원 연결 시 이렇게 말하세요:

[인사말]
"안녕하세요, [상황에 맞는 구체적인 멘트]"

💡 추가 팁:
- [상담 시 주의할 점이나 협상 전략 1~3개]

핵심만 간결하게 작성하세요. 상담원이 들었을 때 명확하고 정중한 톤을 유지하세요.`,

  /**
   * 3. 해지 방어 코칭
   */
  cancellation_coaching: (query: string, center?: CenterData) => `
사용자가 ${center?.name || "서비스"}를 해지하려고 합니다. 유지팀 대응 시뮬레이션과 협상 전략을 제공해주세요.

사용자 상황: "${query}"
${center ? `기업: ${center.name}
카테고리: ${center.category}` : ""}

다음 형식으로 답변해주세요:

🛡️ 유지팀 대응 가이드

**유지팀이 보통 제안하는 것:**
1. [일반적인 할인 제안]
2. [추가 혜택 제안]
3. [기타 유지 조건]

**협상 전략:**
- [효과적인 협상 멘트와 전략]
- [더 좋은 조건을 이끌어내는 방법]

**최종 거절 시:**
- [깔끔하게 해지하는 방법]
- [위약금/잔여 혜택 확인 포인트]

${center?.category === "통신" ? "통신사 유지팀의 일반적인 제안 패턴을 기반으로 작성해주세요." : ""}
실제 경험에 기반한 실용적인 조언을 해주세요.`,

  /**
   * 4. 민원 대필
   */
  complaint_draft: (query: string, center?: CenterData) => `
사용자가 ${center?.name || "기업"}에 대해 민원/항의를 하려 합니다. 공식 민원 글을 작성해주세요.

사용자 상황: "${query}"
${center ? `대상 기업: ${center.name}` : ""}

다음 형식으로 민원 글을 작성해주세요:

📝 민원 글

**제목:** [간결하고 명확한 제목]

**내용:**
[정중하지만 단호한 톤의 민원 본문]
- 문제 상황 서술
- 기대하는 해결 방안
- 관련 법적 근거 (소비자기본법, 전자상거래법, 약관의규제에관한법률 등 해당되는 것)

**법적 근거:**
- [관련 법 조항 인용]

**제출처 안내:**
- 1372 소비자상담센터 (☎ 1372)
- 공정거래위원회 (www.ftc.go.kr)
- 한국소비자원 (www.kca.go.kr)
${center?.category === "통신" ? "- 방송통신위원회 (www.kcc.go.kr)" : ""}
${center?.category === "은행" || center?.category === "카드" ? "- 금융감독원 (www.fss.or.kr, ☎ 1332)" : ""}

실제 민원에 사용할 수 있도록 구체적이고 격식 있게 작성해주세요.`,

  /**
   * 5. 복합 문제 해결
   */
  complex_resolution: (query: string) => `
사용자가 여러 고객센터에 관련된 복합적인 문제를 가지고 있습니다.

사용자 상황: "${query}"

사용 가능한 고객센터 DB: SKT, KT, LG U+, KB국민은행, 신한은행, 하나은행, 우리은행, NH농협은행, 삼성카드, 현대카드, KB국민카드, 신한카드, 롯데카드, 국민건강보험공단, 국민연금공단, 정부24, 쿠팡, 배달의민족, 네이버, 카카오

다음 형식으로 답변해주세요:

🔄 복합 문제 해결 가이드

**문제 분석:**
[여러 기업에 걸친 문제 정리]

**해결 순서:**
1️⃣ [첫 번째로 해결할 것]
   - 기업: [기업명]
   - 방법: [앱/전화/웹]
   - 예상 소요: [시간]

2️⃣ [두 번째로 해결할 것]
   - 기업: [기업명]
   - 방법: [앱/전화/웹]
   - 예상 소요: [시간]

(필요한 만큼 추가)

💡 효율 팁:
- [동시에 처리할 수 있는 것]
- [순서가 중요한 이유]

가능한 한 전화 없이 앱/웹으로 해결하는 방법을 우선 안내하고, 전화가 필요한 경우 ARS 최단 경로를 포함해주세요.`,
};

// ===== Claude API 호출 =====

/**
 * Claude API를 호출하여 프리미엄 기능 실행
 */
export async function callClaudeAPI(request: AIRequest): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      type: request.type,
      content: "API 키가 설정되지 않았습니다. 환경변수 ANTHROPIC_API_KEY를 설정해주세요.",
    };
  }

  const promptBuilder = PROMPTS[request.type];
  if (!promptBuilder) {
    return {
      success: false,
      type: request.type,
      content: "지원하지 않는 기능입니다.",
    };
  }

  const userPrompt = promptBuilder(request.query, request.center);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Claude API error:", response.status, errorData);
      return {
        success: false,
        type: request.type,
        content: `API 호출 실패 (${response.status}). 잠시 후 다시 시도해주세요.`,
      };
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";
    const tokensUsed =
      (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

    // intent_analysis인 경우 JSON 파싱 시도
    let structured: Record<string, unknown> | undefined;
    if (request.type === "intent_analysis") {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structured = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // JSON 파싱 실패 시 그냥 텍스트로 반환
      }
    }

    return {
      success: true,
      type: request.type,
      content,
      structured,
      tokensUsed,
    };
  } catch (error) {
    console.error("Claude API call failed:", error);
    return {
      success: false,
      type: request.type,
      content: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
    };
  }
}

// ===== 편의 함수들 =====

/**
 * 자연어 의도 분석 (키워드 매칭 실패 시 폴백)
 */
export async function analyzeIntent(query: string): Promise<AIResponse> {
  return callClaudeAPI({ type: "intent_analysis", query });
}

/**
 * 맞춤 상담 멘트 생성
 */
export async function generateScript(
  query: string,
  center?: CenterData
): Promise<AIResponse> {
  return callClaudeAPI({ type: "custom_script", query, center });
}

/**
 * 해지 방어 코칭
 */
export async function getCancellationCoaching(
  query: string,
  center?: CenterData
): Promise<AIResponse> {
  return callClaudeAPI({ type: "cancellation_coaching", query, center });
}

/**
 * 민원 대필
 */
export async function draftComplaint(
  query: string,
  center?: CenterData
): Promise<AIResponse> {
  return callClaudeAPI({ type: "complaint_draft", query, center });
}

/**
 * 복합 문제 해결
 */
export async function resolveComplex(query: string): Promise<AIResponse> {
  return callClaudeAPI({ type: "complex_resolution", query });
}

// ===== 프리미엄 미리보기 (블러 처리용) =====

/**
 * 프리미엄 기능의 미리보기 텍스트 생성 (무료 사용자에게 보여줄 내용)
 */
export function getPremiumPreview(
  type: PremiumFeatureType,
  center?: CenterData
): { title: string; preview: string; icon: string } {
  switch (type) {
    case "custom_script":
      return {
        title: "맞춤 상담 멘트",
        preview: `${center?.name || "고객센터"} 상담원 연결 시 최적의 멘트를 AI가 생성해드립니다.`,
        icon: "PRO",
      };
    case "cancellation_coaching":
      return {
        title: "해지 방어 코칭",
        preview: `${center?.name || "서비스"} 유지팀의 예상 제안과 협상 전략을 알려드립니다.`,
        icon: "PRO",
      };
    case "complaint_draft":
      return {
        title: "민원 대필",
        preview: `소비자보호법 근거가 포함된 공식 민원 글을 자동으로 작성해드립니다.`,
        icon: "PRO",
      };
    case "complex_resolution":
      return {
        title: "복합 문제 해결",
        preview: `여러 기업에 걸친 문제를 한 번에 분석하고 최적 해결 순서를 안내합니다.`,
        icon: "PRO",
      };
    default:
      return {
        title: "프리미엄 기능",
        preview: "AI가 더 정확하고 상세한 해결책을 제공합니다.",
        icon: "PRO",
      };
  }
}
