-- Poteto: Minimalist Neon (PostgreSQL) Schema
-- Run via Neon SQL Editor or `psql $DATABASE_URL -f db/schema.sql`

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. 玩家手绘土豆库
CREATE TABLE IF NOT EXISTS potato_drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(64) NOT NULL,          -- 匿名用户标识，用于次日回访战报
  audit_date DATE NOT NULL,                -- 创作日期（YYYY-MM-DD）
  prompt_id VARCHAR(32) NOT NULL,          -- 当日命题 ID
  path_data JSONB NOT NULL,                -- 归一化后的笔画数组（< 1KB）
  status VARCHAR(16) DEFAULT 'pending',    -- pending / approved / hidden
  fooled_count INT DEFAULT 0,              -- 在次日测试中被选中的次数
  report_count INT DEFAULT 0,              -- 被举报次数
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_potato_drawings_date_status
  ON potato_drawings (audit_date, status);

CREATE INDEX IF NOT EXISTS idx_potato_drawings_client_date
  ON potato_drawings (client_id, audit_date DESC);

-- 2. 每日精选池（每天 UTC 00:00 前生成，供次日全球同题读取）
CREATE TABLE IF NOT EXISTS daily_pools (
  audit_date DATE PRIMARY KEY,
  seed VARCHAR(32) NOT NULL,
  stage2_game_id VARCHAR(32) NOT NULL,
  stage3_prompt_id VARCHAR(32) NOT NULL,
  featured_drawing_ids UUID[] NOT NULL     -- 精选的 9-12 张昨日画作 ID
);
