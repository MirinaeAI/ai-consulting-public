/*
  # 어드민 관리를 위한 RPC 함수 생성

  1. 새 함수
    - get_admin_users: 어드민 사용자 목록을 가져오는 함수
    - add_admin_user: 새 어드민을 추가하는 함수
    - remove_admin_user: 어드민을 제거하는 함수

  2. 보안
    - 모든 함수는 어드민만 실행 가능
*/

-- 어드민 사용자 목록을 가져오는 함수
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  user_id uuid,
  email text
) SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION '권한이 없습니다';
  END IF;

  RETURN QUERY
  SELECT a.user_id, u.email
  FROM admins a
  JOIN auth.users u ON u.id = a.user_id;
END;
$$ LANGUAGE plpgsql;

-- 새 어드민을 추가하는 함수
CREATE OR REPLACE FUNCTION add_admin_user(admin_email text)
RETURNS uuid SECURITY DEFINER
AS $$
DECLARE
  new_admin_id uuid;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION '권한이 없습니다';
  END IF;

  -- 이메일로 사용자 ID 찾기
  SELECT id INTO new_admin_id
  FROM auth.users
  WHERE email = admin_email;

  IF new_admin_id IS NULL THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다: %', admin_email;
  END IF;

  -- 어드민 추가
  INSERT INTO admins (user_id)
  VALUES (new_admin_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql;

-- 어드민을 제거하는 함수
CREATE OR REPLACE FUNCTION remove_admin_user(admin_user_id uuid)
RETURNS void SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION '권한이 없습니다';
  END IF;

  DELETE FROM admins
  WHERE user_id = admin_user_id;
END;
$$ LANGUAGE plpgsql;