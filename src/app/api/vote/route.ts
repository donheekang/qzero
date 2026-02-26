import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

/**
 * IP를 해시화하여 익명 중복 방지
 */
function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip + "qzero-salt").digest("hex").slice(0, 16);
}

/**
 * POST /api/vote
 * 크라우드소싱 투표 저장
 *
 * Body: { centerId: string, voteType: "up" | "down" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { centerId, voteType } = body as {
      centerId: string;
      voteType: "up" | "down";
    };

    if (!centerId || !voteType || !["up", "down"].includes(voteType)) {
      return NextResponse.json(
        { error: "centerId와 voteType(up/down)은 필수입니다." },
        { status: 400 }
      );
    }

    // IP 해시 (익명 중복 방지)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIP(ip);

    // upsert: 같은 IP + 같은 센터면 투표 변경
    const { data, error } = await supabase
      .from("votes")
      .upsert(
        {
          center_id: centerId,
          vote_type: voteType,
          ip_hash: ipHash,
        },
        { onConflict: "center_id,ip_hash" }
      )
      .select();

    if (error) {
      console.error("Vote insert error:", error);
      return NextResponse.json(
        { error: "투표 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Vote API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vote?centerId=skt
 * 센터별 투표 집계 조회
 */
export async function GET(request: NextRequest) {
  const centerId = request.nextUrl.searchParams.get("centerId");

  if (!centerId) {
    return NextResponse.json(
      { error: "centerId 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("vote_summary")
    .select("*")
    .eq("center_id", centerId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found (정상 — 아직 투표 없음)
    console.error("Vote summary error:", error);
    return NextResponse.json(
      { error: "집계 조회에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    centerId,
    upCount: data?.up_count || 0,
    downCount: data?.down_count || 0,
    totalCount: data?.total_count || 0,
  });
}
