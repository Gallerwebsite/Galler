import { NextResponse } from "next/server";
import { API_URL } from "@/app/lib/apiUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lightweight keep-alive: pings the Render API health endpoint.
 * Intended for Vercel Cron (Pro) or any external scheduler.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const healthUrl = `${API_URL.replace(/\/$/, "")}/api/health`;

  try {
    const res = await fetch(healthUrl, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    const body = await res.json().catch(() => null);

    return NextResponse.json(
      {
        ok: res.ok,
        upstreamStatus: res.status,
        upstream: body,
        pinged: healthUrl,
        at: new Date().toISOString(),
      },
      { status: res.ok ? 200 : 502 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        pinged: healthUrl,
        error: error instanceof Error ? error.message : "Keep-alive failed",
        at: new Date().toISOString(),
      },
      { status: 502 },
    );
  }
}
