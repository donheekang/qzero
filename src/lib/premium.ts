/**
 * Qzero 프리미엄 접근 제어
 *
 * Supabase subscriptions 테이블 기반 구독 관리
 * 결제 연동 전까지는 수동으로 DB에서 plan 변경
 */

import { supabase } from "@/lib/supabase";

// ===== 프리미엄 상태 관리 =====

export interface PremiumStatus {
  isPremium: boolean;
  plan: "free" | "premium";
  expiresAt: string | null;
  dailyAIUsage: number;
  dailyAILimit: number;
  subscriptionId: string | null;
}

/**
 * 이메일 기반 프리미엄 상태 조회 (Supabase)
 * email이 없으면 무료 사용자로 반환
 */
export async function checkPremiumStatus(email?: string | null): Promise<PremiumStatus> {
  const FREE_STATUS: PremiumStatus = {
    isPremium: false,
    plan: "free",
    expiresAt: null,
    dailyAIUsage: 0,
    dailyAILimit: 0,
    subscriptionId: null,
  };

  if (!email) return FREE_STATUS;

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) return FREE_STATUS;

    // 일일 사용량 리셋 (날짜가 바뀌었으면)
    const today = new Date().toISOString().split("T")[0];
    if (data.daily_ai_reset_at !== today) {
      await supabase
        .from("subscriptions")
        .update({ daily_ai_usage: 0, daily_ai_reset_at: today })
        .eq("id", data.id);
      data.daily_ai_usage = 0;
    }

    const isPremium =
      data.plan === "premium" &&
      (!data.expires_at || new Date(data.expires_at) > new Date());

    return {
      isPremium,
      plan: data.plan,
      expiresAt: data.expires_at,
      dailyAIUsage: data.daily_ai_usage,
      dailyAILimit: isPremium ? PREMIUM_PLANS.monthly.dailyLimit : 0,
      subscriptionId: data.id,
    };
  } catch {
    return FREE_STATUS;
  }
}

/**
 * AI 사용 후 일일 사용량 증가 + 로그 저장
 */
export async function incrementAIUsage(
  subscriptionId: string,
  featureType: string,
  query: string,
  tokensUsed: number
): Promise<void> {
  try {
    // 사용량 +1
    await supabase.rpc("increment_daily_ai_usage", { sub_id: subscriptionId });

    // 로그 저장
    await supabase.from("ai_usage_logs").insert({
      subscription_id: subscriptionId,
      feature_type: featureType,
      query: query.slice(0, 500), // 쿼리 길이 제한
      tokens_used: tokensUsed,
    });
  } catch (error) {
    console.error("AI usage tracking error:", error);
  }
}

/**
 * 동기 버전 (하위 호환) — Supabase 없이 기본값 반환
 */
export function checkPremiumStatusSync(): PremiumStatus {
  return {
    isPremium: false,
    plan: "free",
    expiresAt: null,
    dailyAIUsage: 0,
    dailyAILimit: 0,
    subscriptionId: null,
  };
}

/**
 * 프리미엄 기능 사용 가능 여부 확인
 */
export function canUsePremiumFeature(status: PremiumStatus): {
  allowed: boolean;
  reason?: string;
} {
  if (!status.isPremium) {
    return {
      allowed: false,
      reason: "프리미엄 구독이 필요한 기능입니다. 월 2,900원으로 모든 AI 기능을 이용해보세요!",
    };
  }

  if (status.dailyAIUsage >= status.dailyAILimit) {
    return {
      allowed: false,
      reason: `일일 AI 사용 한도(${status.dailyAILimit}회)에 도달했습니다. 내일 다시 이용 가능합니다.`,
    };
  }

  return { allowed: true };
}

// ===== 프리미엄 가격 정보 =====

export const PREMIUM_PLANS = {
  monthly: {
    price: 2900,
    currency: "KRW",
    period: "월",
    features: [
      "AI 맞춤 상담 멘트 생성",
      "해지 방어 코칭 (유지팀 대응 시뮬레이션)",
      "민원 대필 (소비자보호법 근거 포함)",
      "복합 문제 해결 (여러 기업 동시 안내)",
      "자연어 검색 (AI 의도 분석)",
      "대기 시간 정밀 예측",
    ],
    dailyLimit: 30,
  },
} as const;

// ===== 프리미엄 전환 유도 데이터 =====

export interface PremiumUpsell {
  feature: string;
  title: string;
  description: string;
  icon: string;
  cta: string;
}

/**
 * 무료 사용자에게 보여줄 프리미엄 기능 잠금 표시
 */
export function getUpsellCards(centerId?: string): PremiumUpsell[] {
  return [
    {
      feature: "custom_script",
      title: "맞춤 상담 멘트",
      description: "상담원에게 정확히 뭐라고 말해야 할지 AI가 알려줘요",
      icon: "PRO",
      cta: "프리미엄으로 잠금 해제",
    },
    {
      feature: "cancellation_coaching",
      title: "해지 방어 코칭",
      description: "유지팀의 예상 제안과 최적 협상 전략을 미리 알려줘요",
      icon: "PRO",
      cta: "프리미엄으로 잠금 해제",
    },
    {
      feature: "complaint_draft",
      title: "민원 대필",
      description: "소비자보호법 근거가 포함된 공식 민원 글을 자동 생성해요",
      icon: "PRO",
      cta: "프리미엄으로 잠금 해제",
    },
    {
      feature: "complex_resolution",
      title: "복합 문제 해결",
      description: "여러 기업에 걸친 문제를 한 번에 분석하고 순서대로 안내해요",
      icon: "PRO",
      cta: "프리미엄으로 잠금 해제",
    },
  ];
}
