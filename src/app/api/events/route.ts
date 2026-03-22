import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db-utils";

const DEFAULT_LAT = 42.3314;
const DEFAULT_LNG = -83.0458;
const DEFAULT_RADIUS_MI = 30;

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || String(DEFAULT_LAT));
  const lng = parseFloat(searchParams.get("lng") || String(DEFAULT_LNG));
  const radius = parseFloat(searchParams.get("radius") || String(DEFAULT_RADIUS_MI));
  const maxCost = searchParams.get("maxCost") ? parseFloat(searchParams.get("maxCost")!) : undefined;
  const isFree = searchParams.get("free") === "true";
  const category = searchParams.get("category") || undefined;
  const daysAhead = parseInt(searchParams.get("days") || "14");
  const limit = parseInt(searchParams.get("limit") || "50");

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);

  try {
    const where: any = {
      status: "active",
      startDateTime: { gte: startDate, lte: endDate },
    };

    if (isFree) where.isFree = true;
    if (maxCost !== undefined) where.cost = { lte: maxCost };
    if (category) where.category = { contains: category, mode: "insensitive" };

    const latDelta = radius / 69;
    const lngDelta = radius / (69 * Math.cos((lat * Math.PI) / 180));
    where.lat = { gte: lat - latDelta, lte: lat + latDelta };
    where.lng = { gte: lng - lngDelta, lte: lng + lngDelta };

    const events = await prisma.externalEvent.findMany({
      where,
      orderBy: { startDateTime: "asc" },
      take: limit * 2,
    });

    const filtered = events
      .filter(e => {
        if (!e.lat || !e.lng) return e.isVirtual;
        return haversineMiles(lat, lng, e.lat, e.lng) <= radius;
      })
      .slice(0, limit);

    return NextResponse.json({ events: filtered, count: filtered.length });
  } catch (error: any) {
    console.error("[API/events] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
