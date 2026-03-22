/**
 * Event Ingestion Service
 * Orchestrates fetching from all sources and upserting into DB.
 */

import { fetchEventbriteEvents, mapEventbriteToExternalEvent } from "./eventbrite-service";
import { fetchTicketmasterEvents, mapTicketmasterToExternalEvent } from "./ticketmaster-service";

// We use a dynamic import for Prisma to avoid edge runtime issues
async function getPrisma() {
  const { default: prisma } = await import("@/lib/db-utils");
  return prisma;
}

export interface IngestionParams {
  city?: string;
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  daysAhead?: number;
}

export interface IngestionResult {
  source: string;
  fetched: number;
  upserted: number;
  errors: number;
}

export async function ingestEventbriteEvents(params: IngestionParams): Promise<IngestionResult> {
  const result: IngestionResult = { source: "eventbrite", fetched: 0, upserted: 0, errors: 0 };

  if (!params.latitude || !params.longitude) {
    console.warn("[Ingestion] Eventbrite requires lat/lng");
    return result;
  }

  try {
    const events = await fetchEventbriteEvents({
      latitude: params.latitude,
      longitude: params.longitude,
      radiusMiles: params.radiusMiles,
      daysAhead: params.daysAhead,
    });

    result.fetched = events.length;
    const prisma = await getPrisma();

    for (const event of events) {
      try {
        const mapped = mapEventbriteToExternalEvent(event);
        await prisma.externalEvent.upsert({
          where: { sourceId_sourceName: { sourceId: mapped.sourceId, sourceName: mapped.sourceName } },
          create: mapped,
          update: {
            title: mapped.title,
            cost: mapped.cost,
            costMax: mapped.costMax,
            isFree: mapped.isFree,
            status: mapped.status,
            imageUrl: mapped.imageUrl,
            startDateTime: mapped.startDateTime,
            endDateTime: mapped.endDateTime,
            updatedAt: new Date(),
          },
        });
        result.upserted++;
      } catch (err) {
        result.errors++;
        console.error("[Ingestion] Eventbrite upsert error:", err);
      }
    }
  } catch (err) {
    console.error("[Ingestion] Eventbrite fetch error:", err);
  }

  return result;
}

export async function ingestTicketmasterEvents(params: IngestionParams): Promise<IngestionResult> {
  const result: IngestionResult = { source: "ticketmaster", fetched: 0, upserted: 0, errors: 0 };

  try {
    const events = await fetchTicketmasterEvents({
      city: params.city,
      latitude: params.latitude,
      longitude: params.longitude,
      radiusMiles: params.radiusMiles,
      daysAhead: params.daysAhead,
    });

    result.fetched = events.length;
    const prisma = await getPrisma();

    for (const event of events) {
      try {
        const mapped = mapTicketmasterToExternalEvent(event);
        await prisma.externalEvent.upsert({
          where: { sourceId_sourceName: { sourceId: mapped.sourceId, sourceName: mapped.sourceName } },
          create: mapped,
          update: {
            title: mapped.title,
            cost: mapped.cost,
            costMax: mapped.costMax,
            isFree: mapped.isFree,
            status: mapped.status,
            imageUrl: mapped.imageUrl,
            startDateTime: mapped.startDateTime,
            endDateTime: mapped.endDateTime,
            updatedAt: new Date(),
          },
        });
        result.upserted++;
      } catch (err) {
        result.errors++;
        console.error("[Ingestion] Ticketmaster upsert error:", err);
      }
    }
  } catch (err) {
    console.error("[Ingestion] Ticketmaster fetch error:", err);
  }

  return result;
}

export async function ingestAllSources(params: IngestionParams): Promise<IngestionResult[]> {
  console.log("[Ingestion] Starting ingestion for params:", params);
  const [eb, tm] = await Promise.all([
    ingestEventbriteEvents(params),
    ingestTicketmasterEvents(params),
  ]);
  console.log("[Ingestion] Complete:", eb, tm);
  return [eb, tm];
}
