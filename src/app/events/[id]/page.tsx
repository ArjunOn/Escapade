import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import type { Metadata } from "next";
import { Calendar, MapPin, DollarSign, ExternalLink, ArrowLeft, Compass } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await db.externalEvent.findUnique({ where: { id } });
  if (!event) return { title: "Event not found — Escapade" };
  return {
    title: `${event.title} — Escapade`,
    description: event.description?.slice(0, 160) ?? `${event.title} in ${event.city ?? "your area"}`,
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 200) ?? "",
      images: event.imageUrl ? [{ url: event.imageUrl }] : [],
      type: "article",
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const event = await db.externalEvent.findUnique({ where: { id } });
  if (!event) notFound();

  const categoryColor: Record<string, string> = {
    Music: "#e91e63", "Sports & Fitness": "#f57c00", Arts: "#00838f",
    "Food & Drink": "#e64a19", Community: "#7b1fa2", Outdoor: "#2e7d32",
    Tech: "#1565c0", Family: "#f9a825", Wellness: "#388e3c",
  };
  const color = categoryColor[event.category ?? ""] ?? "#1a73e8";

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Minimal header */}
      <header className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3">
        <Link href="/discover" className="p-1.5 rounded-full hover:bg-[var(--color-bg-alt)] transition-colors">
          <ArrowLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <Compass className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-[var(--color-text-primary)]">Escapade</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-5">
        {/* Hero */}
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.imageUrl} alt={event.title}
            className="w-full h-64 object-cover rounded-2xl" />
        ) : (
          <div className="w-full h-48 rounded-2xl flex items-center justify-center"
            style={{ background: color + "18" }}>
            <Compass className="w-12 h-12" style={{ color }} />
          </div>
        )}

        {/* Title + badges */}
        <div className="space-y-2">
          {event.category && (
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: color + "18", color }}>
              {event.category}
            </span>
          )}
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] leading-snug">
            {event.title}
          </h1>
        </div>

        {/* Details card */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <Calendar className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]" />
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">
                {format(new Date(event.startDateTime), "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-xs">
                {format(new Date(event.startDateTime), "h:mm a")}
                {event.endDateTime && ` – ${format(new Date(event.endDateTime), "h:mm a")}`}
              </p>
            </div>
          </div>

          {(event.locationName || event.address) && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <MapPin className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]" />
              <div>
                {event.locationName && <p className="font-medium text-[var(--color-text-primary)]">{event.locationName}</p>}
                {event.address && <p className="text-xs">{event.address}</p>}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <DollarSign className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]" />
            {event.isFree ? (
              <span className="font-semibold text-[var(--color-success)]">Free</span>
            ) : (
              <span className="font-medium text-[var(--color-text-primary)]">
                ${event.cost}{event.costMax && ` – $${event.costMax}`}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">About this event</h2>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-line">
              {event.description.slice(0, 800)}
              {event.description.length > 800 && "…"}
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-3 pb-8">
          <a href={event.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-dark)] transition-colors">
            <ExternalLink className="w-4 h-4" /> Get Tickets on {event.sourceName}
          </a>
          <Link href="/signup"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-bg-alt)] transition-colors">
            <Compass className="w-4 h-4" /> Plan this with Escapade — it&apos;s free
          </Link>
        </div>
      </div>
    </div>
  );
}
