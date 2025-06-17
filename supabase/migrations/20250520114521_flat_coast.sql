/*
  # 사용자 테이블 생성

  1. 새 테이블
    - `users`
      - `id` (uuid, 기본 키)
      - `email` (text, 고유)
      - `created_at` (timestamp)
  2. 보안
    - users 테이블에 RLS 활성화
    - 인증된 사용자만 자신의 데이터 읽기/수정 가능
*/

-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS(Row Level Security) 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자가 자신의 정보만 볼 수 있도록 정책 설정
CREATE POLICY "사용자는 자신의 데이터만 볼 수 있음"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 인증된 사용자가 자신의 정보만 수정할 수 있도록 정책 설정
CREATE POLICY "사용자는 자신의 데이터만 수정 가능"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);