/*
  # 어드민 역할 및 권한 설정

  1. 변경사항
    - 어드민 역할을 위한 사용자 메타데이터 추가
    - is_admin 함수 업데이트
*/

-- 어드민 확인 함수 업데이트
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'is_admin', 'false')::boolean
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;