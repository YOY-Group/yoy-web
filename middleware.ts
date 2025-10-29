import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ========== OPS BASIC AUTH PROTECTION ==========
  if (pathname.startsWith("/ops")) {
    const auth = req.headers.get("authorization") || "";
    const user = process.env.OPS_USER || "";
    const pass = process.env.OPS_PASS || "";

    // Dev mode convenience
    if (!user || !pass) return NextResponse.next();

    const expected = "Basic " + btoa(`${user}:${pass}`);
    if (auth !== expected) {
      return new NextResponse("Auth required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="YOY Ops"' },
      });
    }

    return NextResponse.next();
  }

  // ========== ADMIN TOKEN GATE ==========
  if (pathname.startsWith("/admin")) {
    const token =
      req.headers.get("x-admin-token") ??
      searchParams.get("key") ??
      "";

    if (token !== process.env.ADMIN_DASHBOARD_TOKEN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ops/:path*", "/admin/:path*"],
};