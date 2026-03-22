/**
 * Ticketmaster Discovery API Service
 * Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 */

const TM_API_KEY = process.env.TICKETMASTER_API_KEY || "EZq8nVHk2AjjxyyJDCbuuDr3m1HoWGMU";
const BASE_URL = "https://app.ticketmaster.com/discovery/v2";

export interface TicketmasterEvent {
  id: string;
  name: string;
  url: string;
  dates: {
    start: { dateTime?: string; localDate: string; localTime?: string };
    end?: { dateTime?: string };
    status: { code: string };
  };
  images: Array<{ url: string; ratio: string; width: number }>;
  _embedded?: {
    venues?: Array<{
      name: string;
      address?: { line1?: string };
      city?: { name: string };
      state?: { stateCode: string };
      location?: { latitude: string; longitude: string };
    }>;
  };
  classifications?: Array<{
    segment?: { name: string };
    genre?: { name: string };
    subGenre?: { name: string };
  }>;
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  info?: string;
  pleaseNote?: string;
}

export async function fetchTicketmasterEvents(params: {
  city?: string;
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  daysAhead?: number;
  size?: number;
}): Promise<TicketmasterEvent[]> {
  const { city, latitude, longitude, radiusMiles = 25, daysAhead = 14, size = 50 } = params;

  const startDate = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);
  const endDateStr = endDate.toISOString().replace(/\.\d{3}Z$/, "Z");

  const queryParams: Record<string, string> = {
    apikey: TM_API_KEY,
    startDateTime: startDate,
    endDateTime: endDateStr,
    size: size.toString(),
    sort: "date,asc",
    countryCode: "US",
  };

  if (latitude && longitude) {
    queryParams.latlong = `${latitude},${longitude}`;
    queryParams.radius = radiusMiles.toString();
    queryParams.unit = "miles";
  } else if (city) {
    queryParams.city = city;
  }

  const url = `${BASE_URL}/events.json?${new URLSearchParams(queryParams).toString()}`;

  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    console.error("[Ticketmaster] Fetch failed:", response.status, await response.text());
    return [];
  }

  const data = await response.json();
  return data._embedded?.events || [];
}

export function mapTicketmasterToExternalEvent(event: TicketmasterEvent) {
  const venue = event._embedded?.venues?.[0];
  const price = event.priceRanges?.[0];
  const classification = event.classifications?.[0];
  const bestImage = event.images?.find(i => i.ratio === "16_9" && i.width > 500)
    || event.images?.[0];

  const startRaw = event.dates.start.dateTime
    || `${event.dates.start.localDate}T${event.dates.start.localTime || "00:00:00"}`;

  const genre = classification?.genre?.name;
  const segment = classification?.segment?.name;
  const tags = [segment, genre].filter(Boolean) as string[];

  const isCancelled = event.dates.status.code === "cancelled"
    || event.dates.status.code === "offsale";

  return {
    sourceId: event.id,
    sourceName: "ticketmaster" as const,
    title: event.name,
    description: event.info?.slice(0, 500) || null,
    startDateTime: new Date(startRaw),
    endDateTime: event.dates.end?.dateTime ? new Date(event.dates.end.dateTime) : null,
    cost: price?.min ?? 0,
    costMax: price?.max ?? null,
    currency: price?.currency || "USD",
    isVirtual: false,
    isFree: !price || price.min === 0,
    locationName: venue?.name || null,
    address: venue?.address?.line1 || null,
    lat: venue?.location?.latitude ? parseFloat(venue.location.latitude) : null,
    lng: venue?.location?.longitude ? parseFloat(venue.location.longitude) : null,
    city: venue?.city?.name || null,
    state: venue?.state?.stateCode || null,
    url: event.url,
    imageUrl: bestImage?.url || null,
    category: segment || genre || "Events",
    tags,
    status: isCancelled ? "cancelled" : "active",
  };
}
