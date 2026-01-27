"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { JournalEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    BookOpen, Sparkles, Calendar as CalendarIcon,
    Smile, Meh, Frown, Rocket, MessageSquare,
    Zap, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function JournalPage() {
    const { journalEntries, addJournalEntry } = useAppStore();
    const [text, setText] = useState('');
    const [mood, setMood] = useState<JournalEntry['mood']>('Neutral');

    const handleSubmit = () => {
        if (!text.trim()) return;
        const newEntry: JournalEntry = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            text,
            mood,
            tags: [],
        };
        addJournalEntry(newEntry);
        setText('');
    };

    const getMoodIcon = (m: JournalEntry['mood']) => {
        switch (m) {
            case 'Happy': return <Smile className="w-5 h-5 text-emerald-400" />;
            case 'Excited': return <Zap className="w-5 h-5 text-yellow-400" />;
            case 'Neutral': return <Meh className="w-5 h-5 text-blue-400" />;
            case 'Sad': return <Frown className="w-5 h-5 text-red-400" />;
            case 'Tired': return <Heart className="w-5 h-5 text-primary" />;
        }
    };

    return (
        <div className="space-y-12 py-6">
            <header className="space-y-4">
                <div className="flex items-center gap-2 text-[#a78bfa]">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Temporal reflection</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif italic text-white tracking-tight">Internal Log</h1>
                <p className="text-white/40 font-medium">Capturing neural signals and gratitude for the escape.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Column */}
                <div className="lg:col-span-12">
                    <Card className="glass border-white/5 overflow-hidden">
                        <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-2xl font-serif italic text-white">New Submission</CardTitle>
                            <CardDescription className="text-white/40">Gratitude for the Escape: What defined your journey today?</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <div className="flex flex-wrap justify-center gap-3">
                                {(['Happy', 'Excited', 'Neutral', 'Sad', 'Tired'] as const).map(m => (
                                    <Button
                                        key={m}
                                        variant="ghost"
                                        onClick={() => setMood(m)}
                                        className={cn(
                                            "flex flex-col h-auto py-4 px-6 gap-2 rounded-2xl border transition-all min-w-[100px]",
                                            mood === m
                                                ? "bg-primary/20 border-primary text-white shadow-lg shadow-primary/10"
                                                : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10"
                                        )}
                                    >
                                        {getMoodIcon(m)}
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{m}</span>
                                    </Button>
                                ))}
                            </div>

                            <div className="relative">
                                <Textarea
                                    placeholder="Begin neural uplink..."
                                    className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/10 rounded-2xl p-6 text-lg font-serif italic focus-visible:ring-primary/50"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                                <div className="absolute top-4 right-4 text-white/10 pointer-events-none">
                                    <MessageSquare className="w-12 h-12" />
                                </div>
                            </div>

                            <Button onClick={handleSubmit} className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20">
                                <Rocket className="w-4 h-4 mr-3" /> Record Entry
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Historical Log Column */}
                <div className="lg:col-span-12 space-y-6">
                    <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-white/20 ml-2">Historical Records</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {journalEntries.length > 0 ? journalEntries.map(entry => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group"
                                >
                                    <Card className="glass border-white/10 hover:border-primary/30 transition-all h-full flex flex-col">
                                        <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                    {getMoodIcon(entry.mood)}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-serif italic text-white">Log Entry</CardTitle>
                                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                                        <CalendarIcon className="w-2.5 h-2.5" /> {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            {(entry.mood === 'Happy' || entry.mood === 'Excited') && <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />}
                                        </CardHeader>
                                        <CardContent className="pt-6 flex-1">
                                            <p className="text-sm leading-relaxed text-white/60 font-serif italic">"{entry.text}"</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )) : (
                                <div className="col-span-full py-20 text-center text-white/10 italic">No historical records synchronized.</div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
