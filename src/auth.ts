import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // 첫 로그인 시 또는 토큰 갱신 시 실행
      if (user) {
        token.id = user.id;
        
        // Supabase에서 유저의 승인 상태 확인
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('is_approved')
          .eq('id', user.id)
          .single();
        
        token.isApproved = profile?.is_approved || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isApproved = token.isApproved as boolean;
        session.user.isAdmin = session.user.email === process.env.ADMIN_EMAIL;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

// 타입 확장 (TypeScript 환경에서 session.user.isApproved 등을 사용하기 위함)
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      isApproved: boolean;
      isAdmin: boolean;
    }
  }
}
