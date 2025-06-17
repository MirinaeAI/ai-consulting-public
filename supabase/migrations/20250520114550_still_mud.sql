/*
  # 추천 내역 테이블 생성

  1. 새 테이블
    - `consultations`
      - `id` (uuid, 기본 키)
      - `user_id` (외래 키, null 가능)
      - `purpose` (text)
      - `org_size` (text)
      - `budget` (numeric)
      - `created_at` (timestamp)
    
    - `recommendations`
      - `id` (uuid, 기본 키)
      - `consultation_id` (외래 키)
      - `tool_id` (외래 키)
      - `order` (integer)
      - `created_at` (timestamp)

  2. 보안
    - 사용자는 자신의 상담 및 추천 내역만 볼 수 있음
*/

-- 사용자 상담 내역 테이블
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE SET NULL,
  purpose text NOT NULL,
  org_size text,
  budget numeric,
  created_at timestamptz DEFAULT now()
);

-- 도구 추천 내역 테이블
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES consultations ON DELETE CASCADE NOT NULL,
  tool_id uuid REFERENCES tools ON DELETE CASCADE NOT NULL,
  "order" integer NOT NULL, -- 추천 순서
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 상담 내역만 볼 수 있음
CREATE POLICY "사용자는 자신의 상담 내역만 볼 수 있음"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신의 상담에 대한 추천만 볼 수 있음
CREATE POLICY "사용자는 자신의 상담에 대한 추천만 볼 수 있음"
  ON recommendations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.id = consultation_id
      AND consultations.user_id = auth.uid()
    )
  );

-- 익명 사용자의 상담 결과 처리를 위한 정책
CREATE POLICY "익명 사용자는 세션 동안만 상담 내역에 접근 가능"
  ON consultations
  FOR SELECT
  TO anon
  USING (user_id IS NULL AND created_at > (now() - interval '1 hour'));

-- 익명 사용자의 추천 결과 처리를 위한 정책
CREATE POLICY "익명 사용자는 세션 동안만 추천 내역에 접근 가능"
  ON recommendations
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.id = consultation_id
      AND consultations.user_id IS NULL
      AND consultations.created_at > (now() - interval '1 hour')
    )
  );