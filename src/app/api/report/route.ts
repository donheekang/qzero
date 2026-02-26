import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip + "qzero-salt").digest("hex").slice(0, 16);
}

/**
 * POST /api/report
 * 정보 오류 제보 저장
 *
 * Body: {
 *   centerId: string,
 *   category: "wrong_menu" | "not_connected" | "hours_changed" | "other",
 *   memo?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { centerId, category, memo } = body as {
      centerId: string;
      category: string;
      memo?: string;
    };

    const validCategories = ["wrong_menu", "not_connected", "hours_changed", "other"];

    if (!centerId || !category || !validCategories.includes(category)) {
      return NextResponse.json(
        { error: "centerId와 유효한 category는 필수입니다." },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIP(ip);

    const { data, error } = await supabase
      .from("reports")
      .insert({
        center_id: centerId,
        category,
        memo: memo || null,
        ip_hash: ipHash,
      })
      .select();

    if (error) {
      console.error("Report insert error:", error);
      return NextResponse.json(
        { error: "제보 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Report API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
