/*
  # 사용자 피드백 테이블 생성

  1. 새 테이블
    - `feedback`
      - `id` (uuid, 기본 키)
      - `user_id` (외래 키, null 가능)
      - `consultation_id` (외래 키)
      - `rating` (integer)
      - `comment` (text)
      - `created_at` (timestamp)
  
  2. 보안
    - 사용자는 자신의 피드백만 관리 가능
    - 관리자는 모든 피드백 조회 가능
*/

-- 사용자 피드백 테이블
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE SET NULL,
  consultation_id uuid REFERENCES consultations ON DELETE CASCADE,
  rating integer CHECK (rating BETWEEN 1 AND 5), -- 1-5 평점
  comment text,
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 피드백만 볼 수 있음
CREATE POLICY "사용자는 자신의 피드백만 볼 수 있음"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신의 피드백만 추가할 수 있음
CREATE POLICY "사용자는 자신의 피드백만 추가할 수 있음"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 피드백만 수정할 수 있음
CREATE POLICY "사용자는 자신의 피드백만 수정할 수 있음"
  ON feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 관리자는 모든 피드백을 볼 수 있음
CREATE POLICY "관리자는 모든 피드백을 볼 수 있음"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- 익명 피드백을 위한 정책
CREATE POLICY "익명 사용자는 세션 동안만 자신의 피드백에 접근 가능"
  ON feedback
  FOR SELECT
  TO anon
  USING (
    user_id IS NULL AND 
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.id = consultation_id
      AND consultations.created_at > (now() - interval '1 hour')
    )
  );