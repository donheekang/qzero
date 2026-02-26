import { NextRequest, NextResponse } from "next/server";
import {
  callClaudeAPI,
  PremiumFeatureType,
} from "@/lib/ai";
import { getCenterById } from "@/lib/centers";

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

    // MVP: 프리미엄 제한 없이 모든 사용자에게 AI 기능 제공
    // TODO: 추후 구독 모델 도입 시 프리미엄 체크 복원

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
