import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase 클라이언트 (싱글톤)
 *
 * 사용법:
 *   import { supabase } from "@/lib/supabase";
 *   const { data } = await supabase.from("votes").select("*");
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ===== DB 타입 정의 =====

export interface VoteRow {
  id: string;
  center_id: string;
  vote_type: "up" | "down";
  created_at: string;
  ip_hash: string;
}

export interface ReportRow {
  id: string;
  center_id: string;
  category: "wrong_menu" | "not_connected" | "hours_changed" | "other";
  memo: string | null;
  created_at: string;
  ip_hash: string;
}

export interface SubscriptionRow {
  id: string;
  email: string;
  plan: "free" | "premium";
  expires_at: string | null;
  daily_ai_usage: number;
  daily_ai_reset_at: string;
  created_at: string;
}

export interface AiUsageLogRow {
  id: string;
  subscription_id: string;
  feature_type: string;
  query: string;
  tokens_used: number;
  created_at: string;
}
