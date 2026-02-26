import { NextRequest, NextResponse } from "next/server";
import { search, suggestCompanies, needsPremiumFeature } from "@/lib/matcher";

/**
 * GET /api/search?q=SKT+해지
 * 키워드 매칭 기반 검색 API
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const mode = searchParams.get("mode"); // "suggest" | "search" (default)

  if (!query) {
    return NextResponse.json(
      { error: "검색어를 입력해주세요", results: [] },
      { status: 400 }
    );
  }

  // 자동완성 모드
  if (mode === "suggest") {
    const suggestions = suggestCompanies(query);
    return NextResponse.json({ suggestions });
  }

  // 검색 모드
  const results = search(query);
  const isPremiumNeeded = needsPremiumFeature(query);

  // 결과가 없는 경우
  if (results.length === 0) {
    return NextResponse.json({
      query,
      results: [],
      isPremiumNeeded,
      message: "일치하는 고객센터를 찾지 못했어요. 다른 키워드로 검색해보세요.",
      suggestPremium: true, // LLM 자연어 분석 제안
    });
  }

  // 결과 반환
  return NextResponse.json({
    query,
    results: results.map((r) => ({
      center: {
        id: r.center.id,
        name: r.center.name,
        category: r.center.category,
        tel: r.center.tel,
        tel_short: r.center.tel_short,
        hours: r.center.hours,
        satisfaction: r.center.satisfaction,
        freshness: r.center.freshness,
      },
      matchType: r.matchType,
      purpose: r.purpose,
      solution: r.solution,
      confidence: r.confidence,
    })),
    isPremiumNeeded,
    suggestPremium: isPremiumNeeded || results[0]?.confidence < 0.5,
  });
}
