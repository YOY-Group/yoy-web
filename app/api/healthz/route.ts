// app/api/healthz/route.ts

export async function GET() {
  return Response.json({
    ok: true,
    service: "yoy-web",
    ts: new Date().toISOString(),
  });
}