"use client";

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import {
    ChevronLeft, ChevronRight, LayoutGrid, List,
    Calendar as CalendarIcon, Wallet, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalendarPage() {
    const { activities, expenses } = useAppStore();
    const [view, setView] = useState<'weekly' | 'monthly'>('monthly');
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const generateMonthlyGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const grid = [];
        for (let i = 0; i < firstDay; i++) grid.push(null);
        for (let i = 1; i <= daysInMonth; i++) grid.push(new Date(year, month, i));
        return grid;
    };

    const getDailyTotal = (dateStr: string) => {
        const expenseTotal = expenses
            .filter(e => e.date.startsWith(dateStr))
            .reduce((sum, e) => sum + e.amount, 0);

        const activityTotal = activities
            .filter(a => a.date === dateStr)
            .reduce((sum, a) => sum + a.cost, 0);

        return expenseTotal + activityTotal;
    };

    const dates = generateMonthlyGrid();

    return (
        <div className="space-y-12 py-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#facc15]">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Temporal Tracking</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-semibold text-slate-900 tracking-tight">Mission Cycle</h1>
                    <p className="text-slate-600 font-medium">Visualizing chronological logistics and operational window.</p>
                </div>
                <div className="flex items-center gap-4 bg-white border border-slate-200 p-2 rounded-2xl">
                    <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-200">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('weekly')}
                            className={cn("h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest", view === 'weekly' ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-700")}
                        >
                            Log View
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('monthly')}
                            className={cn("h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest", view === 'monthly' ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-700")}
                        >
                            Cycle View
                        </Button>
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex gap-1 text-slate-900">
                        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="h-9 w-9 hover:bg-slate-100">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="px-4 text-xs font-bold uppercase tracking-widest flex items-center">{monthNames[currentDate.getMonth()]}</div>
                        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="h-9 w-9 hover:bg-slate-100">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {view === 'monthly' ? (
                    <motion.div
                        key="monthly"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass border-slate-200 overflow-hidden"
                    >
                        <div className="grid grid-cols-7 border-b border-slate-200">
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                                <div key={d} className="py-4 text-[10px] font-bold text-slate-400 tracking-[0.2em] text-center border-r border-slate-200 last:border-r-0">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7">
                            {dates.map((date, i) => {
                                if (!date) return <div key={`empty-${i}`} className="min-h-[120px] bg-slate-50 border-r border-b border-slate-200" />;
                                const dateStr = date.toISOString().split('T')[0];
                                const dayActivities = activities.filter(a => a.date === dateStr);
                                const totalSpent = getDailyTotal(dateStr);
                                const isToday = dateStr === new Date().toISOString().split('T')[0];

                                return (
                                    <div key={dateStr} className={cn(
                                        "min-h-[120px] border-r border-b border-slate-200 p-3 flex flex-col justify-between group transition-all relative overflow-hidden",
                                        isToday && "bg-primary/5",
                                        totalSpent > 0 && "bg-slate-50 hover:bg-slate-100"
                                    )}>
                                        <div className="flex justify-between items-start">
                                            <span className={cn("text-xs font-bold", isToday ? "text-primary" : "text-slate-500")}>{date.getDate()}</span>
                                            {totalSpent > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1 mt-2">
                                            {dayActivities.slice(0, 2).map(a => (
                                                <div key={a.id} className="truncate text-[8px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                                    {a.title}
                                                </div>
                                            ))}
                                            {dayActivities.length > 2 && <div className="text-[8px] text-slate-400 font-bold ml-1">+{dayActivities.length - 2} MORE</div>}
                                        </div>

                                        {totalSpent > 0 && (
                                            <div className="mt-auto pt-2 flex items-center gap-1.5 text-emerald-400">
                                                <Wallet className="w-2.5 h-2.5" />
                                                <span className="text-[10px] font-bold font-mono tracking-tighter text-emerald-400">-${totalSpent.toFixed(0)}</span>
                                            </div>
                                        )}

                                        {isToday && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="weekly"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {Array.from({ length: 14 }).map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() + (i - 7)); // Show 7 days past, 7 days future
                            const dateStr = d.toISOString().split('T')[0];
                            const dayActivities = activities.filter(a => a.date === dateStr);
                            const totalSpent = getDailyTotal(dateStr);
                            const isToday = dateStr === new Date().toISOString().split('T')[0];

                            return (
                                <Card key={dateStr} className={cn("glass border-slate-200", isToday && "border-primary/20 bg-primary/5")}>
                                    <div className="px-6 py-4 flex flex-row justify-between items-center">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center w-12">
                                                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                <div className={cn("text-xl font-bold", isToday ? "text-primary" : "text-slate-900")}>{d.getDate()}</div>
                                            </div>
                                            <div className="h-8 w-px bg-slate-200" />
                                            <div>
                                                <div className="text-sm font-bold text-slate-900">{dayActivities.length} Operations Scheduled</div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Temporal Intelligence</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Aggregate Spend</div>
                                            <div className={cn("text-xl font-mono font-bold", totalSpent > 0 ? "text-emerald-500" : "text-slate-300")}>
                                                ${totalSpent.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
