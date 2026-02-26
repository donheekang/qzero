-- ============================================
-- Qzero Supabase 마이그레이션
-- Supabase 대시보드 > SQL Editor에서 실행
-- ============================================

-- 1. 크라우드소싱 투표 테이블
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 같은 IP에서 같은 센터에 중복 투표 방지
CREATE UNIQUE INDEX IF NOT EXISTS votes_unique_ip_center
  ON votes (center_id, ip_hash);

-- 센터별 집계 빠르게 하기 위한 인덱스
CREATE INDEX IF NOT EXISTS votes_center_id_idx ON votes (center_id);

-- 2. 정보 오류 제보 테이블
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('wrong_menu', 'not_connected', 'hours_changed', 'other')),
  memo TEXT,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reports_center_id_idx ON reports (center_id);

-- 3. 구독 테이블 (프리미엄)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  expires_at TIMESTAMPTZ,
  daily_ai_usage INT DEFAULT 0,
  daily_ai_reset_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_email_idx ON subscriptions (email);

-- 4. AI 사용 로그 테이블
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  query TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_logs_sub_id_idx ON ai_usage_logs (subscription_id);
CREATE INDEX IF NOT EXISTS ai_logs_created_idx ON ai_usage_logs (created_at);

-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================

-- votes: 누구나 INSERT 가능, 집계 SELECT만 허용
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes_insert_anyone" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "votes_select_anyone" ON votes
  FOR SELECT USING (true);

-- reports: 누구나 INSERT 가능, 읽기는 관리자만 (anon은 불가)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_insert_anyone" ON reports
  FOR INSERT WITH CHECK (true);

-- subscriptions: anon key로 이메일 기반 조회 가능
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_by_email" ON subscriptions
  FOR SELECT USING (true);

CREATE POLICY "subscriptions_update_own" ON subscriptions
  FOR UPDATE USING (true);

-- ai_usage_logs: INSERT만 허용
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_logs_insert" ON ai_usage_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- RPC: 일일 AI 사용량 증가 함수
-- ============================================

CREATE OR REPLACE FUNCTION increment_daily_ai_usage(sub_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET daily_ai_usage = daily_ai_usage + 1
  WHERE id = sub_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 투표 집계용 뷰 (센터별 좋아요/싫어요 수)
-- ============================================

CREATE OR REPLACE VIEW vote_summary AS
SELECT
  center_id,
  COUNT(*) FILTER (WHERE vote_type = 'up') AS up_count,
  COUNT(*) FILTER (WHERE vote_type = 'down') AS down_count,
  COUNT(*) AS total_count
FROM votes
GROUP BY center_id;
