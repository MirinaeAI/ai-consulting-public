/*
  # Fix get_admin_users function return type

  1. Changes
    - 기존 get_admin_users 함수를 삭제하고 올바른 반환 타입으로 재생성
    - email 컬럼의 타입을 text로 명시적으로 캐스팅

  2. Security
    - 기존 보안 설정 유지 (admin만 접근 가능)
*/

-- Drop existing function if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_admin_users'
  ) THEN
    DROP FUNCTION get_admin_users;
  END IF;
END $$;

-- Recreate the function with correct return type
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  user_id uuid,
  email text
) 
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    a.user_id,
    (auth.users.email)::text as email
  FROM admins a
  JOIN auth.users ON auth.users.id = a.user_id;
END;
$$ LANGUAGE plpgsql;