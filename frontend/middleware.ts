import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  isSessionExpiryActive,
} from "./src/shared/lib/authSession";

function isProtectedAdminPath(pathname: string): boolean {
  return pathname === "/admin" || (pathname.startsWith("/admin/") && pathname !== "/admin/login");
}

function buildLoginRedirect(request: NextRequest, loginPath: string): NextResponse {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = loginPath;
  redirectUrl.search = "";
  redirectUrl.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(redirectUrl);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasCustomerSession = isSessionExpiryActive(request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  const hasAdminSession = isSessionExpiryActive(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (pathname === "/auth/login" && hasCustomerSession) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/account";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/admin/login" && hasAdminSession) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/account") && !hasCustomerSession) {
    return buildLoginRedirect(request, "/auth/login");
  }

  if (isProtectedAdminPath(pathname) && !hasAdminSession) {
    return buildLoginRedirect(request, "/admin/login");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/auth/login", "/admin/:path*"],
};