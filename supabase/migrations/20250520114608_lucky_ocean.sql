/*
  # 도구 제출 양식 테이블 생성

  1. 새 테이블
    - `tool_submissions`
      - `id` (uuid, 기본 키)
      - `name` (text)
      - `description` (text)
      - `url` (text)
      - `submitter_email` (text)
      - `price_min` (numeric)
      - `price_max` (numeric)
      - `is_free_tier` (boolean)
      - `categories` (text[])
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. 보안
    - 제출자는 자신이 제출한 양식만 조회 가능
    - 관리자는 모든 제출 양식 관리 가능
*/

-- 도구 제출 상태 열거형
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');

-- 도구 제출 양식 테이블
CREATE TABLE IF NOT EXISTS tool_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  submitter_email text NOT NULL,
  price_min numeric DEFAULT 0,
  price_max numeric,
  is_free_tier boolean DEFAULT false,
  categories text[],
  status submission_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE tool_submissions ENABLE ROW LEVEL SECURITY;

-- 제출자는 자신이 제출한 양식만 볼 수 있음
CREATE POLICY "제출자는 자신이 제출한 양식만 볼 수 있음"
  ON tool_submissions
  FOR SELECT
  TO public
  USING (submitter_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 익명 사용자도 양식 제출 가능
CREATE POLICY "누구나 도구 양식을 제출할 수 있음"
  ON tool_submissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 관리자는 모든 제출 양식을 볼 수 있음
CREATE POLICY "관리자는 모든 제출 양식을 볼 수 있음"
  ON tool_submissions
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- 관리자만 상태 업데이트 가능
CREATE POLICY "관리자만 제출 양식을 업데이트할 수 있음"
  ON tool_submissions
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- 업데이트 시 updated_at 자동 업데이트 트리거
CREATE TRIGGER update_tool_submissions_updated_at
BEFORE UPDATE ON tool_submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();