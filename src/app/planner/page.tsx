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
    const { activities, addActivity, removeActivity, toggleActivity, completeMission } = useAppStore();

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
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Weekend Planning</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">Plan Your Weekend</h1>
                <p className="text-slate-500 font-medium">Add activities, set your budget, and make the most of your time.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Deployment Parameters */}
                <div className="lg:col-span-12">
                    <Card className="glass border-slate-200 overflow-hidden">
                        <CardHeader className="p-8 border-b border-slate-200 bg-white">
                            <CardTitle className="text-2xl font-bold text-slate-900">Add an Activity</CardTitle>
                            <CardDescription className="text-slate-500">Fill in the details of what you'd like to do this weekend.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-700">Activity Name</Label>
                                    <Input
                                        placeholder="e.g. Beach volleyball, Dinner..."
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="bg-slate-50 border-slate-200 text-slate-900 h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-700">Date & Time</Label>
                                    <div className="flex gap-2">
                                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 h-12 flex-1" />
                                        <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-slate-50 border-slate-200 text-slate-900 h-12 w-28" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-700">Category</Label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value as any)}
                                        className="w-full h-12 rounded-md bg-slate-50 border border-slate-200 text-slate-900 text-xs px-3 outline-none"
                                    >
                                        {Object.keys(CATEGORY_ICONS).map(c => (
                                            <option key={c} value={c} className="bg-white">{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold tracking-widest text-slate-700">Estimated Cost</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={cost}
                                            onChange={e => setCost(e.target.value)}
                                            className="bg-slate-50 border-slate-200 text-slate-900 h-12 flex-1"
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

                {/* Activities List */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-slate-500">Your Plan</h2>
                        {activities.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={completeMission}
                                className="border-primary/20 hover:bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-xl h-8 px-4"
                            >
                                Complete Weekend
                            </Button>
                        )}
                    </div>
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
                                            "glass border-slate-200 group hover:border-primary/20 transition-all",
                                            act.completed && "opacity-60 grayscale-[0.5]"
                                        )}>
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                                                        act.category === 'Relaxation' ? 'bg-[#60a5fa]/10 text-[#60a5fa]' :
                                                            act.category === 'Social' ? 'bg-[#34d399]/10 text-[#34d399]' :
                                                                act.category === 'Outdoor' ? 'bg-[#facc15]/10 text-[#facc15]' :
                                                                    act.category === 'Sports' ? 'bg-[#f87171]/10 text-[#f87171]' :
                                                                        'bg-[#a78bfa]/10 text-[#a78bfa]'
                                                    )}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className={cn("text-lg font-semibold text-slate-900 transition-all", act.completed && "line-through text-slate-400")}>{act.title}</h4>
                                                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
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
                                                        className={cn("h-10 w-10 rounded-xl", act.completed ? "text-primary bg-primary/10" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100")}
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
                                <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Compass className="w-8 h-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-500 font-medium">No activities planned yet.</p>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Add activities above to get started.</p>
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
