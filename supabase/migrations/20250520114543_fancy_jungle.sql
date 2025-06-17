/*
  # 즐겨찾기 테이블 생성 

  1. 새 테이블
    - `favorites`
      - `id` (uuid, 기본 키)
      - `user_id` (외래 키)
      - `tool_id` (외래 키)
      - `created_at` (timestamp)
  2. 보안
    - 사용자는 자신의 즐겨찾기만 관리 가능
*/

-- 즐겨찾기 테이블
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE NOT NULL,
  tool_id uuid REFERENCES tools ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  -- 한 사용자가 동일한 도구를 한 번만 즐겨찾기할 수 있도록 제약
  UNIQUE(user_id, tool_id)
);

-- RLS 활성화
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 즐겨찾기만 볼 수 있음
CREATE POLICY "사용자는 자신의 즐겨찾기만 볼 수 있음"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신의 즐겨찾기만 추가할 수 있음
CREATE POLICY "사용자는 자신의 즐겨찾기만 추가할 수 있음"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 즐겨찾기만 삭제할 수 있음
CREATE POLICY "사용자는 자신의 즐겨찾기만 삭제할 수 있음"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 인기 도구 랭킹을 위한 뷰 생성
CREATE VIEW popular_tools AS
SELECT 
  t.id,
  t.name,
  t.description,
  t.url,
  t.price_min,
  t.price_max,
  t.is_free_tier,
  COUNT(f.id) as saved_count
FROM tools t
LEFT JOIN favorites f ON t.id = f.tool_id
GROUP BY t.id
ORDER BY saved_count DESC;