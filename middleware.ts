import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Basic auth for /ops/*
  const auth = req.headers.get("authorization") || "";
  const user = process.env.OPS_USER || "";
  const pass = process.env.OPS_PASS || "";

  // Dev convenience: if not configured, allow
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

export const config = { matcher: ["/ops/:path*"] };