export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    {
      ok: true,
      service: "someone.help",
      ts: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
