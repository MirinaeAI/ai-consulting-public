/*
  # 초기 AI 도구 및 카테고리 데이터 추가

  1. 카테고리 추가
    - 텍스트 생성
    - 이미지 생성
    - 코드 작성
    - 음성/오디오
    - 데이터 분석
    - 생산성
    - 마케팅
    - 협업
    - 번역
    - 고객 서비스

  2. AI 도구 추가
    - 10개의 대표적인 AI 도구 추가
    - 각 도구의 상세 정보 포함
    - 도구-카테고리 연결 설정
*/

-- 카테고리 추가
INSERT INTO categories (name, description) VALUES
  ('텍스트 생성', 'AI를 활용한 텍스트 콘텐츠 생성 도구'),
  ('이미지 생성', 'AI 기반 이미지 생성 및 편집 도구'),
  ('코드 작성', '코드 자동 생성 및 개발 지원 도구'),
  ('음성/오디오', '음성 합성 및 오디오 처리 도구'),
  ('데이터 분석', 'AI 기반 데이터 분석 및 시각화 도구'),
  ('생산성', '업무 효율성 향상을 위한 AI 도구'),
  ('마케팅', '마케팅 자동화 및 콘텐츠 제작 도구'),
  ('협업', '팀 협업을 위한 AI 기반 도구'),
  ('번역', 'AI 기반 언어 번역 및 로컬라이제이션 도구'),
  ('고객 서비스', 'AI 챗봇 및 고객 지원 자동화 도구')
ON CONFLICT (name) DO NOTHING;

-- AI 도구 추가
INSERT INTO tools (name, description, url, price_min, price_max, is_free_tier) VALUES
  (
    'ChatGPT',
    '자연어 처리 기반의 대화형 AI 도구로, 텍스트 생성, 코드 작성, 분석 등 다양한 작업을 수행할 수 있습니다.',
    'https://chat.openai.com',
    0,
    20,
    true
  ),
  (
    'Midjourney',
    '텍스트 프롬프트를 기반으로 고품질 이미지를 생성하는 AI 도구입니다. 예술, 디자인, 마케팅 등 다양한 분야에서 활용 가능합니다.',
    'https://www.midjourney.com',
    10,
    60,
    false
  ),
  (
    'GitHub Copilot',
    'AI 기반 코드 자동 완성 도구로, 개발자의 생산성을 크게 향상시킵니다.',
    'https://github.com/features/copilot',
    10,
    10,
    false
  ),
  (
    'Notion AI',
    '문서 작성, 요약, 번역, 아이디어 발상을 돕는 AI 기반 생산성 도구입니다.',
    'https://www.notion.so',
    10,
    20,
    true
  ),
  (
    'Jasper',
    '마케팅 콘텐츠 생성에 특화된 AI 작문 도구로, 블로그, 소셜 미디어, 광고 문구 등을 작성할 수 있습니다.',
    'https://www.jasper.ai',
    40,
    120,
    false
  ),
  (
    'Stable Diffusion',
    '오픈 소스 기반의 이미지 생성 AI로, 로컬 설치와 API 사용이 모두 가능합니다.',
    'https://stability.ai',
    0,
    20,
    true
  ),
  (
    'Anthropic Claude',
    '높은 정확도와 안전성을 자랑하는 대화형 AI 어시스턴트입니다.',
    'https://www.anthropic.com/claude',
    20,
    60,
    true
  ),
  (
    'Synthesia',
    'AI 기반 비디오 생성 플랫폼으로, 텍스트를 자연스러운 영상으로 변환합니다.',
    'https://www.synthesia.io',
    30,
    100,
    false
  ),
  (
    'DeepL',
    '고품질 AI 번역 서비스로, 자연스러운 번역 결과를 제공합니다.',
    'https://www.deepl.com',
    0,
    30,
    true
  ),
  (
    'Grammarly',
    'AI 기반 글쓰기 교정 및 개선 도구로, 문법, 맞춤법, 문체를 교정합니다.',
    'https://www.grammarly.com',
    0,
    30,
    true
  )
ON CONFLICT (name) DO NOTHING;

-- 도구-카테고리 연결
WITH tool_category_mapping AS (
  SELECT 
    t.id as tool_id,
    c.id as category_id,
    t.name as tool_name,
    c.name as category_name
  FROM tools t
  CROSS JOIN categories c
  WHERE 
    (t.name = 'ChatGPT' AND c.name IN ('텍스트 생성', '코드 작성', '생산성')) OR
    (t.name = 'Midjourney' AND c.name IN ('이미지 생성', '마케팅')) OR
    (t.name = 'GitHub Copilot' AND c.name IN ('코드 작성', '생산성')) OR
    (t.name = 'Notion AI' AND c.name IN ('텍스트 생성', '생산성', '협업')) OR
    (t.name = 'Jasper' AND c.name IN ('텍스트 생성', '마케팅')) OR
    (t.name = 'Stable Diffusion' AND c.name IN ('이미지 생성')) OR
    (t.name = 'Anthropic Claude' AND c.name IN ('텍스트 생성', '코드 작성', '데이터 분석')) OR
    (t.name = 'Synthesia' AND c.name IN ('음성/오디오', '마케팅')) OR
    (t.name = 'DeepL' AND c.name IN ('번역', '생산성')) OR
    (t.name = 'Grammarly' AND c.name IN ('텍스트 생성', '생산성'))
)
INSERT INTO tool_categories (tool_id, category_id)
SELECT tool_id, category_id FROM tool_category_mapping
ON CONFLICT (tool_id, category_id) DO NOTHING;