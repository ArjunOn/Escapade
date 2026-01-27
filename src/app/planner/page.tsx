"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Calendar, Clock, MapPin, Plus,
    Trash2, Check, X, Target, Rocket,
    Zap, Coffee, Heart, Music, Waves
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/lib/types';

const CATEGORY_ICONS: Record<string, any> = {
    'Sports': Zap,
    'Relaxation': Coffee,
    'Social': Heart,
    'Events': Music,
    'Outdoor': Waves,
    'Traveling': Rocket,
    'Other': Target
};

export default function PlannerPage() {
    const { activities, addActivity, removeActivity, toggleActivity } = useAppStore();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<Category>('Social');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [cost, setCost] = useState('');

    const handleAdd = () => {
        if (!title || !date || !time) return;
        addActivity({
            id: crypto.randomUUID(),
            title,
            category,
            date,
            startTime: time,
            cost: parseFloat(cost) || 0,
            completed: false,
        });
        setTitle('');
        setCost('');
    };

    return (
        <div className="space-y-12 py-6">
            <header className="space-y-4">
                <div className="flex items-center gap-2 text-[#60a5fa]">
                    <Rocket className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Operational Planning</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif italic text-white tracking-tight">Flight Plan</h1>
                <p className="text-white/40 font-medium">Drafting mission parameters for the upcoming weekend window.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Deployment Parameters */}
                <div className="lg:col-span-12">
                    <Card className="glass border-white/5 overflow-hidden">
                        <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-2xl font-serif italic text-white">Initialize Operation</CardTitle>
                            <CardDescription className="text-white/40">Enter mission coordinates and logistics requirements.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Mission Title</Label>
                                    <Input
                                        placeholder="Operation Name..."
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Temporal Window</Label>
                                    <div className="flex gap-2">
                                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 flex-1" />
                                        <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-white/5 border-white/10 text-white h-12 w-28" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Classification</Label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value as any)}
                                        className="w-full h-12 rounded-md bg-white/5 border border-white/10 text-white text-xs px-3 outline-none"
                                    >
                                        {Object.keys(CATEGORY_ICONS).map(c => (
                                            <option key={c} value={c} className="bg-slate-900">{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Logistics Cost ($)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={cost}
                                            onChange={e => setCost(e.target.value)}
                                            className="bg-white/5 border-white/10 text-white h-12 flex-1"
                                        />
                                        <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white h-12 px-6 rounded-xl">
                                            <Plus className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Operations Manifest */}
                <div className="lg:col-span-12 space-y-6">
                    <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-white/20 ml-2">Active Manifest</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {activities.length > 0 ? activities.map(act => {
                                const Icon = CATEGORY_ICONS[act.category as any] || Target;
                                return (
                                    <motion.div
                                        key={act.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <Card className={cn(
                                            "glass border-white/5 group hover:border-primary/20 transition-all",
                                            act.completed && "opacity-60 grayscale-[0.5]"
                                        )}>
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg",
                                                        act.category === 'Relaxation' ? 'bg-[#60a5fa]/10 text-[#60a5fa] shadow-blue-500/5' :
                                                            act.category === 'Social' ? 'bg-[#34d399]/10 text-[#34d399] shadow-emerald-500/5' :
                                                                act.category === 'Outdoor' ? 'bg-[#facc15]/10 text-[#facc15] shadow-yellow-500/5' :
                                                                    act.category === 'Sports' ? 'bg-[#f87171]/10 text-[#f87171] shadow-red-500/5' :
                                                                        'bg-[#a78bfa]/10 text-[#a78bfa] shadow-purple-500/5'
                                                    )}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className={cn("text-lg font-serif italic text-white transition-all", act.completed && "line-through text-white/40")}>{act.title}</h4>
                                                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">
                                                            <Calendar className="w-3 h-3" /> {act.date}
                                                            <span className="w-1 h-1 rounded-full bg-white/10" />
                                                            <Clock className="w-3 h-3" /> {act.startTime}
                                                            {act.cost > 0 && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-white/10" />
                                                                    <span className="text-emerald-400">${act.cost}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => toggleActivity(act.id)}
                                                        className={cn("h-10 w-10 rounded-xl", act.completed ? "text-primary bg-primary/10" : "text-white/20 hover:text-white hover:bg-white/5")}
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => removeActivity(act.id)}
                                                        className="h-10 w-10 rounded-xl text-red-400/20 hover:text-red-400 hover:bg-red-400/5"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            }) : (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                        <Compass className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white/40 font-medium">Manifest currently empty.</p>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/20 mt-1">Initialize missions to begin tracking.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Compass({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
}
