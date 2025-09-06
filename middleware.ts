import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const OWNER_ONLY_PREFIXES = ["/master"]; // Halaman Master Data hanya untuk OWNER

export default withAuth(
  function middleware(req) {
    const { nextUrl } = req;
    const token = (req as any).nextauth?.token as any | null;
    const isLogin = nextUrl.pathname === "/login";
    const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

    // Redirect to login when not authenticated
    if (!token && !isLogin && !isApiAuth) {
      const url = new URL("/login", nextUrl.origin);
      url.searchParams.set("next", nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Prevent visiting /login when already signed in
    if (isLogin && token) {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }

    // OWNER-only guard
    if (
      token &&
      OWNER_ONLY_PREFIXES.some((p) => nextUrl.pathname.startsWith(p)) &&
      token.role !== "OWNER"
    ) {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Always run; we'll decide inside
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-touch-icon.png|sitemap.xml|robots.txt).*)",
  ],
};
