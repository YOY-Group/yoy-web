// apps/web/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // ---- /ops basic auth (unchanged) ----
  if (pathname.startsWith("/ops")) {
    const auth = req.headers.get("authorization") || "";
    const user = process.env.OPS_USER || "";
    const pass = process.env.OPS_PASS || "";
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

  // ---- /admin token + no-store headers ----
  if (pathname.startsWith("/admin")) {
    const token =
      req.headers.get("x-admin-token") ||
      url.searchParams.get("key") ||
      "";
    if (token !== process.env.ADMIN_DASHBOARD_TOKEN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ops/:path*", "/admin/:path*"],
};