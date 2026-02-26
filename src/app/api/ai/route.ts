import { NextRequest, NextResponse } from "next/server";
import {
  callClaudeAPI,
  getPremiumPreview,
  PremiumFeatureType,
} from "@/lib/ai";
import { getCenterById } from "@/lib/centers";
import { checkPremiumStatus, canUsePremiumFeature, incrementAIUsage } from "@/lib/premium";

/**
 * POST /api/ai
 * 프리미엄 AI 기능 엔드포인트
 *
 * Body:
 * {
 *   type: "custom_script" | "cancellation_coaching" | "complaint_draft" | "complex_resolution" | "intent_analysis",
 *   query: "사용자 입력",
 *   centerId?: "skt" (선택),
 *   email?: "user@example.com" (프리미엄 확인용)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, query, centerId, email } = body as {
      type: PremiumFeatureType;
      query: string;
      centerId?: string;
      email?: string;
    };

    // 입력 검증
    if (!type || !query) {
      return NextResponse.json(
        { error: "type과 query는 필수입니다." },
        { status: 400 }
      );
    }

    const validTypes: PremiumFeatureType[] = [
      "intent_analysis",
      "custom_script",
      "cancellation_coaching",
      "complaint_draft",
      "complex_resolution",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `지원하지 않는 기능입니다. 사용 가능: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // 프리미엄 상태 확인 (intent_analysis는 시스템 내부 호출이므로 체크 skip)
    let premiumStatus = null;
    if (type !== "intent_analysis") {
      premiumStatus = await checkPremiumStatus(email);
      const { allowed, reason } = canUsePremiumFeature(premiumStatus);

      if (!allowed) {
        // 무료 사용자: 미리보기만 반환
        const center = centerId ? getCenterById(centerId) : undefined;
        const preview = getPremiumPreview(type, center);

        return NextResponse.json({
          success: false,
          locked: true,
          preview,
          message: reason,
          plan: {
            price: "월 2,900원",
            cta: "프리미엄 시작하기",
          },
        });
      }
    }

    // 고객센터 데이터 조회
    const center = centerId ? getCenterById(centerId) : undefined;

    // Claude API 호출
    const result = await callClaudeAPI({
      type,
      query,
      center,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.content,
        },
        { status: 500 }
      );
    }

    // 프리미엄 사용자: AI 사용 기록 저장
    if (premiumStatus?.subscriptionId && type !== "intent_analysis") {
      await incrementAIUsage(
        premiumStatus.subscriptionId,
        type,
        query,
        result.tokensUsed || 0
      );
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      type: result.type,
      content: result.content,
      structured: result.structured,
      tokensUsed: result.tokensUsed,
    });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
