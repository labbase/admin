import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // ✅ accessToken 가져오기
  const token = req.cookies.get("accessToken")?.value;

  // ✅ Next 내부 파일 & API 제외
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // ✅ public pages
  const publicPaths = ["/login", "/reset"];
  const isPublic = publicPaths.some((path) =>
    pathname.startsWith(path)
  );

  // ✅ 로그인 페이지 처리
  if (isPublic) {
    // 로그인 상태면 /login 못 들어가게
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  // ✅ 방법 C: access 없어도 통과
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};