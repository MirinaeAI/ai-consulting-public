/*
  # 카테고리 및 태그 테이블 생성

  1. 새 테이블
    - `categories`
      - `id` (uuid, 기본 키)
      - `name` (text, 고유)
      - `description` (text)
    - `tool_categories`
      - `tool_id` (외래 키)
      - `category_id` (외래 키)
  2. 보안
    - 모든 사용자가 카테고리 정보를 볼 수 있음
    - 관리자만 카테고리 추가/수정 가능
*/

-- 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text
);

-- 도구-카테고리 연결 테이블 (다대다 관계)
CREATE TABLE IF NOT EXISTS tool_categories (
  tool_id uuid REFERENCES tools ON DELETE CASCADE,
  category_id uuid REFERENCES categories ON DELETE CASCADE,
  PRIMARY KEY (tool_id, category_id)
);

-- RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;

-- 누구나 카테고리 목록을 볼 수 있음
CREATE POLICY "카테고리 목록은 공개 읽기 가능"
  ON categories
  FOR SELECT
  TO public
  USING (true);

-- 누구나 도구-카테고리 연결 정보를 볼 수 있음
CREATE POLICY "도구-카테고리 관계는 공개 읽기 가능"
  ON tool_categories
  FOR SELECT
  TO public
  USING (true);

-- 관리자만 카테고리 추가 가능
CREATE POLICY "관리자만 카테고리 추가 가능"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- 관리자만 카테고리 수정 가능
CREATE POLICY "관리자만 카테고리 수정 가능"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- 관리자만 도구-카테고리 연결 추가 가능
CREATE POLICY "관리자만 도구-카테고리 연결 추가 가능"
  ON tool_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- 관리자만 도구-카테고리 연결 삭제 가능
CREATE POLICY "관리자만 도구-카테고리 연결 삭제 가능"
  ON tool_categories
  FOR DELETE
  TO authenticated
  USING (is_admin());