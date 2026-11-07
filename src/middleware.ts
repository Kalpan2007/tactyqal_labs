import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/api/constants";

/**
 * Gate for the admin area. This only checks that a session cookie is present:
 * the value itself is verified on every API call, which is where the data is.
 * Doing the compare here too would need the Node crypto API, which the Edge
 * runtime does not provide.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!request.cookies.get(ADMIN_COOKIE)?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
