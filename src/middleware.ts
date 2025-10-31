import { NextResponse, type NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isApi = request.nextUrl.pathname.startsWith("/api");

  // Check for Auth.js/NextAuth session token cookies (v4 and v5, prod and dev names)
  const sessionToken =
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value;
  const isAuthenticated = Boolean(sessionToken);

  // Always redirect from root to /presentation
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/presentation", request.url));
  }

  // If user is on auth page but already signed in, redirect to home page
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/presentation", request.url));
  }

  // If user is not authenticated and trying to access a protected route, redirect to sign-in
  if (!isAuthenticated && !isAuthPage && !isApi) {
    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(request.url)}`,
        request.url,
      ),
    );
  }

  return NextResponse.next();
}

// Protect everything except public assets and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
