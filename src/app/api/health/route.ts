import { NextResponse } from "next/server";
import prisma from "@/lib/db-utils";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    // Count ingested events
    let eventCount = 0;
    try { eventCount = await prisma.externalEvent.count(); } catch (_) {}

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      ai_provider: process.env.AI_PROVIDER || "mock",
      events_in_db: eventCount,
      version: "2.0",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "unhealthy", timestamp: new Date().toISOString(), database: "disconnected", error: error.message },
      { status: 500 }
    );
  }
}
