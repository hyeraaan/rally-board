import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApproved = req.auth?.user?.isApproved;
  const isAdmin = req.auth?.user?.isAdmin;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/login"].includes(nextUrl.pathname);
  const isUnauthorizedRoute = nextUrl.pathname === "/unauthorized";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // 1. 로그인하지 않은 경우
  if (!isLoggedIn && !isPublicRoute && !isApiAuthRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 2. 로그인했지만 승인되지 않은 경우
  if (isLoggedIn && !isApproved && !isUnauthorizedRoute && !isApiAuthRoute && !isAdminRoute) {
    // 관리자 본인은 미승인 상태여도 (만약의 경우) 접속 허용하고 싶다면 조건 추가 가능
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  // 3. 관리자 페이지 접근 제어
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 4. 이미 로그인/승인된 유저가 로그인 페이지나 미승인 페이지에 접근할 때
  if (isLoggedIn && isApproved && (isPublicRoute || isUnauthorizedRoute)) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

// 미들웨어를 적용할 경로 설정
// api 경로를 제외하여 Auth.js 라우트 핸들러가 직접 처리하도록 합니다.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
