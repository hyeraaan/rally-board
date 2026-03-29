import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  throw new Error("환경 변수 'NEXT_PUBLIC_SUPABASE_URL'이 누락되었거나 유효한 URL이 아닙니다. .env.local 파일을 확인해 주세요.");
}

if (!supabaseAnonKey) {
  throw new Error("환경 변수 'NEXT_PUBLIC_SUPABASE_ANON_KEY'가 누락되었습니다. .env.local 파일을 확인해 주세요.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
