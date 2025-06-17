/*
  # AI 도구 테이블 생성

  1. 새 테이블
    - `tools`
      - `id` (uuid, 기본 키)
      - `name` (text, 고유)
      - `description` (text)
      - `url` (text)
      - `price_min` (numeric)
      - `price_max` (numeric)
      - `is_free_tier` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. 보안
    - 모든 사용자가 도구 정보를 볼 수 있음
    - 관리자만 도구 정보 추가/수정 가능
*/

CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  price_min numeric DEFAULT 0,
  price_max numeric,
  is_free_tier boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS(Row Level Security) 설정
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- 누구나 도구 목록을 볼 수 있음
CREATE POLICY "도구 목록은 공개 읽기 가능"
  ON tools
  FOR SELECT
  TO public
  USING (true);

-- 함수 생성: 관리자 확인
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  -- 실제 구현시 관리자 역할 확인 로직 추가 필요
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND email LIKE '%@yourdomain.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 관리자만 도구 추가 가능
CREATE POLICY "관리자만 도구 추가 가능"
  ON tools
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- 관리자만 도구 수정 가능
CREATE POLICY "관리자만 도구 수정 가능"
  ON tools
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- 업데이트 시 updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tools_updated_at
BEFORE UPDATE ON tools
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();