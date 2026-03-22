import { NextRequest, NextResponse } from "next/server";
import { ingestAllSources } from "@/services/event-ingestion";

const DEFAULT_PARAMS = {
  lat: 42.3314, lng: -83.0458, city: "Detroit", radiusMiles: 30, daysAhead: 14,
};

// POST — manual trigger from the UI (Discover page "Sync Events" button)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { lat, lng, city, radiusMiles, daysAhead } = { ...DEFAULT_PARAMS, ...body };
    const results = await ingestAllSources({ latitude: lat, longitude: lng, city, radiusMiles, daysAhead });
    return NextResponse.json({ success: true, results, total: results.reduce((s, r) => s + r.upserted, 0) });
  } catch (error: any) {
    console.error("[API/events/ingest] POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — cron-friendly trigger (call via Vercel Cron, GitHub Actions, etc.)
// Example cron URL: GET /api/events/ingest?secret=YOUR_CRON_SECRET
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const results = await ingestAllSources(DEFAULT_PARAMS);
    return NextResponse.json({ success: true, results, total: results.reduce((s, r) => s + r.upserted, 0) });
  } catch (error: any) {
    console.error("[API/events/ingest] GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

