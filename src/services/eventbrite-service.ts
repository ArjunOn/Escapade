/**
 * Eventbrite API Service
 * Fetches real events near a location and upserts them into the database.
 * API Docs: https://www.eventbrite.com/platform/api
 */

export interface EventbriteEvent {
  id: string;
  name: { text: string };
  description: { text: string };
  start: { utc: string };
  end: { utc: string };
  url: string;
  is_free: boolean;
  logo?: { url: string };
  category_id?: string;
  venue?: {
    name: string;
    address: {
      localized_address_display: string;
      city: string;
      region: string;
      latitude: string;
      longitude: string;
    };
  };
  ticket_availability?: {
    minimum_ticket_price?: { major_value: string; currency: string };
    maximum_ticket_price?: { major_value: string; currency: string };
  };
}

const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY || "7TQSLIUJPK4EDS7OQSQC";
const BASE_URL = "https://www.eventbriteapi.com/v3";

const CATEGORY_MAP: Record<string, string> = {
  "103": "Music",
  "101": "Business",
  "110": "Food & Drink",
  "113": "Community",
  "105": "Arts",
  "104": "Film & Media",
  "108": "Sports & Fitness",
  "107": "Science & Tech",
  "102": "Seasonal",
  "109": "Travel & Outdoor",
  "111": "Charity",
  "112": "Government",
  "115": "Family & Education",
  "116": "Holiday",
  "117": "Health",
  "118": "Hobbies",
  "119": "Other",
};

export async function fetchEventbriteEvents(params: {
  latitude: number;
  longitude: number;
  radiusMiles?: number;
  daysAhead?: number;
  pageSize?: number;
}): Promise<EventbriteEvent[]> {
  const { latitude, longitude, radiusMiles = 25, daysAhead = 14, pageSize = 50 } = params;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);

  const queryParams = new URLSearchParams({
    "location.latitude": latitude.toString(),
    "location.longitude": longitude.toString(),
    "location.within": `${radiusMiles}mi`,
    "start_date.range_start": startDate.toISOString(),
    "start_date.range_end": endDate.toISOString(),
    "expand": "venue,ticket_availability,logo",
    "page_size": pageSize.toString(),
    "sort_by": "date",
  });

  const response = await fetch(
    `${BASE_URL}/events/search/?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${EVENTBRITE_API_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("[Eventbrite] Fetch failed:", response.status, error);
    return [];
  }

  const data = await response.json();
  return data.events || [];
}

export function mapEventbriteToExternalEvent(event: EventbriteEvent) {
  const venue = event.venue;
  const ticketing = event.ticket_availability;
  const cost = ticketing?.minimum_ticket_price
    ? parseFloat(ticketing.minimum_ticket_price.major_value)
    : 0;
  const costMax = ticketing?.maximum_ticket_price
    ? parseFloat(ticketing.maximum_ticket_price.major_value)
    : undefined;

  return {
    sourceId: event.id,
    sourceName: "eventbrite" as const,
    title: event.name.text,
    description: event.description?.text?.slice(0, 500) || null,
    startDateTime: new Date(event.start.utc),
    endDateTime: event.end?.utc ? new Date(event.end.utc) : null,
    cost,
    costMax: costMax ?? null,
    currency: ticketing?.minimum_ticket_price?.currency || "USD",
    isVirtual: !venue,
    isFree: event.is_free || cost === 0,
    locationName: venue?.name || null,
    address: venue?.address?.localized_address_display || null,
    lat: venue?.address?.latitude ? parseFloat(venue.address.latitude) : null,
    lng: venue?.address?.longitude ? parseFloat(venue.address.longitude) : null,
    city: venue?.address?.city || null,
    state: venue?.address?.region || null,
    url: event.url,
    imageUrl: event.logo?.url || null,
    category: event.category_id ? (CATEGORY_MAP[event.category_id] || "Other") : "Other",
    tags: event.category_id ? [CATEGORY_MAP[event.category_id] || "Other"] : [],
    status: "active" as const,
  };
}
