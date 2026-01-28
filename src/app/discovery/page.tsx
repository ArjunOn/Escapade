"use client";

import { useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from '@/lib/store';
import { Sparkles, MapPin, Calendar, Clock, Search, Radar, Star, Check } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data (Discovery)
import { MOCK_EVENTS, DiscoveryEvent } from '@/lib/data';

function DiscoveryContent() {
    const searchParams = useSearchParams();
    const { userProfile, activities, addActivity, initializeEvent, initializedEventIds } = useAppStore();
    const initialCategory = searchParams.get('category') || 'All';
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Relaxation', 'Social', 'Outdoor', 'Sports', 'Events', 'Traveling'];

    const filteredEvents = useMemo(() => {
        let results = MOCK_EVENTS;

        if (selectedCategory !== 'All') {
            results = results.filter((e: DiscoveryEvent) => e.category === selectedCategory);
        }

        if (searchQuery) {
            results = results.filter((e: DiscoveryEvent) =>
                e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Add matching logic
        return results.map((event: DiscoveryEvent) => {
            const matchScore = event.tags.filter((t: string) => userProfile?.preferences.includes(t)).length;
            const vibeScore = event.vibes.filter((v: string) => userProfile?.vibes.includes(v)).length;
            const isInitialized = activities.some(a => a.originalEventId === event.id);
            return {
                ...event,
                isMatched: matchScore > 0 || vibeScore > 0,
                priority: matchScore + vibeScore,
                isInitialized
            };
        }).sort((a: any, b: any) => b.priority - a.priority);

    }, [selectedCategory, searchQuery, userProfile, initializedEventIds]);

    const handleQuickAdd = (event: DiscoveryEvent) => {
        initializeEvent({
            id: event.id,
            title: event.title,
            category: event.category as any,
            cost: event.cost,
            date: event.date,
            time: event.time,
            location: event.location
        });
    };

    return (
        <div className="space-y-12 py-6">
            <header className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                    <Radar className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Intelligence Scan</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif italic text-white tracking-tight">Discovery</h1>
                <p className="text-white/40 font-medium">Scanning local coordinates for peak-relevance escapades.</p>
            </header>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                        placeholder="Search tags, locations, or missions..."
                        className="bg-white/5 border-white/10 text-white pl-12 h-14 rounded-2xl placeholder:text-white/10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? "default" : "outline"}
                            onClick={() => setSelectedCategory(cat)}
                            className={cn(
                                "whitespace-nowrap rounded-full h-10 px-6 font-bold uppercase tracking-widest text-[10px] transition-all",
                                selectedCategory === cat ? "bg-primary border-primary" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                            )}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredEvents.map((event) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group"
                        >
                            <Card className={cn(
                                "glass h-full border-white/5 group-hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden",
                                event.isMatched && "bg-primary/5"
                            )}>
                                {event.isMatched && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[8px] font-bold uppercase tracking-widest">
                                            <Star className="w-2.5 h-2.5 fill-primary" />
                                            Matched for You
                                        </div>
                                    </div>
                                )}
                                <CardHeader className="space-y-4">
                                    <div className="text-4xl">{event.icon}</div>
                                    <div>
                                        <CardTitle className="text-xl font-serif italic text-white group-hover:text-primary transition-colors">{event.title}</CardTitle>
                                        <div className="flex items-center gap-2 mt-1">
                                            {event.tags.slice(0, 3).map(t => (
                                                <span key={t} className="text-[8px] font-bold text-white/20 uppercase tracking-widest">#{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-white/40">
                                            <MapPin className="w-3.5 h-3.5" /> {event.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-white/40">
                                            <Calendar className="w-3.5 h-3.5" /> {event.date} • {event.time}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="text-xl font-bold text-white">${event.cost}</div>
                                        <Button
                                            size="sm"
                                            onClick={() => !event.isInitialized && handleQuickAdd(event)}
                                            disabled={event.isInitialized}
                                            className={cn(
                                                "transition-all h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest",
                                                event.isInitialized
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                                                    : "bg-white/5 hover:bg-primary text-white border-none"
                                            )}
                                        >
                                            {event.isInitialized ? (
                                                <span className="flex items-center gap-2">
                                                    <Check className="w-3 h-3" /> Initialized
                                                </span>
                                            ) : "Initialize"}
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

export default function DiscoveryPage() {
    return (
        <Suspense fallback={<div className="py-20 text-center text-white/20 italic">Synchronizing discovery intelligence...</div>}>
            <DiscoveryContent />
        </Suspense>
    );
}
