import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { Provider } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 익명 키를 가져옵니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase 클라이언트 인스턴스를 생성합니다
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// 사용자 인증 관련 함수
export const auth = {
  // 이메일/비밀번호로 회원가입
  signUp: async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  },

  // 이메일/비밀번호로 로그인
  signIn: async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  },

  // OAuth 로그인
  signInWithOAuth: async (provider: Provider) => {
    const redirectURL = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/callback`
      : `${window.location.origin}/auth/callback`;
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectURL
      }
    });
  },

  // 로그아웃
  signOut: async () => {
    return supabase.auth.signOut();
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: async () => {
    return supabase.auth.getUser();
  },

  // 세션 정보 가져오기
  getSession: async () => {
    return supabase.auth.getSession();
  }
};

// 데이터베이스 관련 함수들은 그대로 유지...
export const db = {
  // ... 기존 코드 유지
};