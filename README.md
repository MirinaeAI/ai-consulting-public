# AI 컨설팅 서비스

AI 도구 추천 및 컨설팅 서비스입니다.

## 기능

- AI 도구 검색 및 추천
- 개인화된 AI 컨설팅
- 구독 기반 프리미엄 서비스 (Polar 결제 시스템)
- 웹훅 기반 실시간 구독 관리

## 환경 설정

### 필수 환경변수

```bash
# Supabase 설정
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Polar 결제 시스템 설정
VITE_POLAR_ACCESS_TOKEN=your_polar_access_token
VITE_POLAR_ENVIRONMENT=sandbox  # 또는 production
VITE_POLAR_PREMIUM_PRODUCT_ID=your_polar_product_id

# 웹훅 설정 (Supabase Edge Function에서 사용)
POLAR_WEBHOOK_SECRET=your_webhook_secret_key

# 기타 설정
VITE_APP_URL=http://localhost:5173
```

### Polar 웹훅 설정

1. **웹훅 엔드포인트**: `https://your-project.supabase.co/functions/v1/polar-webhook`

2. **Polar 대시보드에서 웹훅 설정**:
   - Polar 대시보드 로그인
   - Settings > Webhooks 메뉴로 이동
   - 새 웹훅 추가
   - URL: 위의 웹훅 엔드포인트 입력
   - 이벤트 선택:
     - `subscription.created`
     - `subscription.updated`
     - `subscription.cancelled`
     - `payment.succeeded`
     - `payment.failed`

3. **웹훅 시크릿 설정**:
   - Polar에서 제공하는 웹훅 시크릿을 `POLAR_WEBHOOK_SECRET` 환경변수에 설정
   - Supabase 프로젝트 설정에서 환경변수 추가

### 웹훅 작동 방식

1. **결제 완료**: 사용자가 Polar 체크아웃에서 결제 완료
2. **웹훅 발송**: Polar가 우리 서버로 `payment.succeeded` 이벤트 발송
3. **구독 업데이트**: 웹훅 함수가 자동으로 Supabase 구독 테이블 업데이트
4. **실시간 반영**: 클라이언트에서 실시간으로 구독 상태 변경 감지
5. **UI 업데이트**: 사용자 화면에 즉시 프리미엄 기능 활성화

### 웹훅의 장점

- **신뢰성**: 결제 상태가 확실히 동기화됨
- **보안**: 클라이언트 사이드에서 구독 상태 조작 불가
- **실시간**: 결제 완료 즉시 서비스 이용 가능
- **자동화**: 수동 개입 없이 모든 구독 상태 변경 처리

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 웹훅 함수 배포 (Supabase CLI 필요)
npx supabase functions deploy polar-webhook
```

## 기술 스택

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **결제**: Polar (웹훅 기반 구독 관리)
- **상태 관리**: React Hooks, Context API
- **실시간**: Supabase Realtime (웹훅 업데이트 실시간 반영)
# ai-consulting-public
