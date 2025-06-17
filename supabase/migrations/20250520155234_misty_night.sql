/*
  # 어드민 관리 테이블 생성

  1. 새 테이블
    - `admins`
      - `user_id` (uuid, 기본 키)
      - `created_at` (timestamp)
  2. 보안
    - 어드민만 다른 어드민을 관리할 수 있음
*/

-- 어드민 테이블 생성
CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 어드민만 다른 어드민을 관리할 수 있음
CREATE POLICY "어드민만 어드민 목록을 볼 수 있음"
  ON admins
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "어드민만 어드민을 추가할 수 있음"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "어드민만 어드민을 삭제할 수 있음"
  ON admins
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- is_admin() 함수 업데이트
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admins
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 첫 번째 어드민 추가 (이메일로 사용자 찾기)
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- 여기에 첫 번째 어드민의 이메일을 입력하세요
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@example.com'
  LIMIT 1;

  IF admin_user_id IS NOT NULL THEN
    INSERT INTO admins (user_id)
    VALUES (admin_user_id)
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;