/*
  # 상담 테이블 INSERT 정책 추가

  1. 보안 정책 추가
    - 인증된 사용자가 자신의 상담을 추가할 수 있도록 허용
    - 익명 사용자도 상담을 추가할 수 있도록 허용 (user_id는 NULL)

  2. 정책 상세
    - 인증된 사용자: user_id가 자신의 ID와 일치해야 함
    - 익명 사용자: user_id가 NULL이어야 함
*/

-- 인증된 사용자를 위한 정책
CREATE POLICY "사용자는 자신의 상담만 추가할 수 있음"
ON consultations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- 익명 사용자를 위한 정책
CREATE POLICY "익명 사용자는 user_id가 NULL인 상담만 추가할 수 있음"
ON consultations
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL
);