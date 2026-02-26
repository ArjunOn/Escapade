"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store";
import { MapPin, Calendar, Clock, Search, Star, Check, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_EVENTS, DiscoveryEvent } from "@/lib/data";

function DiscoverContent() {
  const searchParams = useSearchParams();
  const { userProfile, activities, initializeEvent, initializedEventIds } = useAppStore();
  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Relaxation", "Social", "Outdoor", "Sports", "Events", "Traveling"];

  const filteredEvents = useMemo(() => {
    let results = MOCK_EVENTS;

    if (selectedCategory !== "All") {
      results = results.filter((e: DiscoveryEvent) => e.category === selectedCategory);
    }

    if (searchQuery) {
      results = results.filter((e: DiscoveryEvent) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return results
      .map((event: DiscoveryEvent) => {
        const matchScore = event.tags.filter((t: string) =>
          userProfile?.preferences.includes(t)
        ).length;
        const vibeScore = event.vibes.filter((v: string) =>
          userProfile?.vibes.includes(v)
        ).length;
        const isInitialized = activities.some((a) => a.originalEventId === event.id);
        return {
          ...event,
          isMatched: matchScore > 0 || vibeScore > 0,
          priority: matchScore + vibeScore,
          isInitialized,
        };
      })
      .sort((a: any, b: any) => b.priority - a.priority);
  }, [selectedCategory, searchQuery, userProfile, initializedEventIds, activities]);

  const handleQuickAdd = (event: DiscoveryEvent) => {
    initializeEvent({
      id: event.id,
      title: event.title,
      category: event.category as any,
      cost: event.cost,
      date: event.date,
      time: event.time,
      location: event.location,
    });
  };

  return (
    <div className="space-y-10 py-6">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wide">
          <Sparkles className="w-3 h-3" />
          Weekend discovery
        </div>
        <h1>Find activities that feel like you</h1>
        <p className="text-sm text-slate-500">
          Browse gentle ideas across budget levels and vibes—then drop your favourites straight into the planner.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search tags, locations, or activities..."
            className="pl-10 h-12 rounded-2xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "whitespace-nowrap rounded-full h-10 px-6 text-[11px] font-semibold uppercase tracking-wide transition-all",
                selectedCategory === cat
                  ? "bg-primary border-primary text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group"
            >
              <Card
                className={cn(
                  "glass h-full transition-all cursor-pointer relative overflow-hidden",
                  event.isMatched && "border-primary/30 bg-primary/5"
                )}
              >
                {event.isMatched && (
                  <div className="absolute top-4 right-4 z-20">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-semibold uppercase tracking-wide">
                      <Star className="w-2.5 h-2.5 fill-primary" />
                      Best fit
                    </div>
                  </div>
                )}
                <CardHeader className="space-y-4">
                  <div className="text-3xl">{event.icon}</div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900 group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {event.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-medium text-slate-500 uppercase tracking-wide"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5" /> {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" /> {event.date} • {event.time}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-lg font-semibold text-slate-800">${event.cost}</div>
                    <Button
                      size="sm"
                      onClick={() => !event.isInitialized && handleQuickAdd(event)}
                      disabled={event.isInitialized}
                      className={cn(
                        "transition-all h-9 px-5 rounded-xl text-[11px] font-semibold uppercase tracking-wide",
                        event.isInitialized
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                          : "bg-primary text-white hover:bg-primary/90"
                      )}
                    >
                      {event.isInitialized ? (
                        <span className="flex items-center gap-2">
                          <Check className="w-3 h-3" /> Added
                        </span>
                      ) : (
                        "Add to weekend"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400 text-sm">Loading ideas...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}


