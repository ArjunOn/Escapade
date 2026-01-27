"use client";

import { useMemo, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Sparkles, Clock, Wallet, ArrowRight,
  Calendar, TrendingUp, Compass, Plus,
  ShieldCheck, Target, Rocket, Edit2, Check
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Helper for countdown
const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / (1000 * 60)) % 60),
          secs: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 font-mono text-3xl md:text-5xl font-extralight tracking-widest text-white">
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase font-bold tracking-tighter opacity-40">Days</span>
      </div>
      <span className="opacity-20">:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase font-bold tracking-tighter opacity-40">Hrs</span>
      </div>
      <span className="opacity-20">:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.mins).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase font-bold tracking-tighter opacity-40">Min</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { userProfile, expenses, weeklySavingsGoal, activities, setWeeklySavingsGoal } = useAppStore();
  const router = require('next/navigation').useRouter();

  // Goal edit state
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(weeklySavingsGoal.toString());

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (userProfile && !userProfile.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [userProfile, router]);

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
  const isWeekend = dayOfWeek === 0 || dayOfWeek >= 5; // Fri, Sat, Sun
  const isSavingMode = !isWeekend;

  // Calculate next Friday at 17:00
  const nextFriday = useMemo(() => {
    const d = new Date();
    const diff = (5 - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
    d.setHours(17, 0, 0, 0);
    return d;
  }, []);

  const totalSpentThisWeek = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const savingsProgress = Math.min((totalSpentThisWeek / (weeklySavingsGoal || 1)) * 100, 100);
  const savingsRemaining = Math.max((weeklySavingsGoal || 0) - totalSpentThisWeek, 0);

  const saveGoal = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val)) {
      setWeeklySavingsGoal(val);
      setIsEditingGoal(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="space-y-12 py-6">
      {/* Header / Mode Indicator */}
      <header className="space-y-2 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-primary"
        >
          {isSavingMode ? (
            <>
              <ShieldCheck className="w-3 h-3" />
              Active Payload: Saving Mode
            </>
          ) : (
            <>
              <Rocket className="w-3 h-3" />
              Mission Status: Adventure Mode
            </>
          )}
        </motion.div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-serif italic text-white tracking-tight">
              {isSavingMode ? "The Gathering." : "The Escapade."}
            </h1>
            <p className="text-white/40 font-medium">Welcome back, {userProfile.name}. Personnel cleared for access.</p>
          </div>
          {isSavingMode && (
            <div className="flex flex-col items-end">
              <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/40 mb-2">Next Departure In</p>
              <CountdownTimer targetDate={nextFriday} />
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Primary Column */}
        <div className="md:col-span-8 space-y-8">
          {isSavingMode ? (
            /* Saving Mode Core UI */
            <Card className="glass overflow-hidden border-primary/20 bg-primary/5">
              <CardContent className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-serif italic text-white">Escapade Fund</h2>
                    <p className="text-sm text-white/40">Maintaining target savings for the upcoming weekend.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold font-mono text-white">${savingsRemaining.toFixed(0)}</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-primary">Target Remaining</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/60">
                    <span>Progress to Goal</span>
                    <span>{savingsProgress.toFixed(0)}%</span>
                  </div>
                  <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${savingsProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute h-full bg-primary shadow-[0_0_20px_rgba(96,165,250,0.5)]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="text-[10px] uppercase font-bold text-white/40 mb-1">Spent so far</div>
                      <div className="text-xl font-bold text-white">${totalSpentThisWeek.toFixed(2)}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 group relative cursor-pointer" onClick={() => !isEditingGoal && setIsEditingGoal(true)}>
                      <div className="text-[10px] uppercase font-bold text-white/40 mb-1 flex items-center gap-1">
                        Weekly Goal
                        {!isEditingGoal && <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
                      {isEditingGoal ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={goalInput}
                            onChange={(e) => setGoalInput(e.target.value)}
                            className="h-8 w-full bg-white/10 border-white/20 text-white text-lg font-bold p-1"
                            autoFocus
                            onBlur={saveGoal}
                            onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
                          />
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-400" onClick={saveGoal}>
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-xl font-bold text-white">${weeklySavingsGoal.toFixed(0)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Adventure Mode Core UI */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif italic text-white">The Flight Plan</h2>
                <Link href="/planner" className="text-xs font-bold text-primary flex items-center gap-2 group">
                  MANAGE ALL <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {activities.length > 0 ? activities.slice(0, 3).map((act) => (
                  <Card key={act.id} className="glass border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                          act.category === 'Relaxation' ? 'bg-[#60a5fa]/20 text-[#60a5fa]' :
                            act.category === 'Social' ? 'bg-[#34d399]/20 text-[#34d399]' :
                              act.category === 'Outdoor' ? 'bg-[#facc15]/20 text-[#facc15]' :
                                act.category === 'Sports' ? 'bg-[#f87171]/20 text-[#f87171]' :
                                  'bg-[#a78bfa]/20 text-[#a78bfa]'
                        )}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{act.title}</h4>
                          <p className="text-xs text-white/40 font-medium">{act.date} • {act.startTime}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-white/10 text-[10px] text-white/40 uppercase font-bold tracking-widest">{act.category}</Badge>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl space-y-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                      <Compass className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-white/40">No activities scheduled yet.</p>
                    <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
                      Draft Flight Plan
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Discovery / Spending Insights */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif italic text-white">
                {isSavingMode ? "Expense Intelligence" : "Recommended Escapades"}
              </h2>
              <Link href={isSavingMode ? "/budget" : "/discovery"} className="text-xs font-bold text-primary flex items-center gap-2 group">
                VIEW INTEL <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isSavingMode ? (
                <>
                  <Card className="glass border-white/10 hover:border-primary/30 transition-all cursor-pointer group">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-400/20 flex items-center justify-center text-orange-400">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Spending Streak</span>
                      </div>
                      <div className="text-2xl font-bold text-white">Optimized</div>
                      <p className="text-xs text-white/40 leading-relaxed">You're spending 15% less than last week. Escapade fund growing.</p>
                    </CardContent>
                  </Card>
                  <Card className="glass border-white/10 hover:border-primary/30 transition-all cursor-pointer group">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-400">
                          <Target className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Financial Alert</span>
                      </div>
                      <div className="text-2xl font-bold text-white">Restricted</div>
                      <p className="text-xs text-white/40 leading-relaxed">Consider skipping non-essential logistics to hit your $400 goal.</p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="glass border-white/10 hover:border-primary/30 transition-all cursor-pointer group overflow-hidden">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/20 text-[8px] font-bold uppercase tracking-widest border-none">Matched for You</Badge>
                      </div>
                      <div className="text-xl font-bold text-white">Morning Hiking Excursion</div>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Compass className="w-3 h-3" /> Eagle Peak Lookout
                      </div>
                    </div>
                  </Card>
                  <Card className="glass border-white/10 hover:border-primary/30 transition-all cursor-pointer group overflow-hidden">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/20 text-[8px] font-bold uppercase tracking-widest border-none">Budget Approved</Badge>
                      </div>
                      <div className="text-xl font-bold text-white">Jazz Night at Studio B</div>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Clock className="w-3 h-3" /> 20:00 - Friday
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column (Quick Actions / Stats) */}
        <div className="md:col-span-4 space-y-8">
          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Logistics Control</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/budget">
                <Button className="w-full justify-start bg-white/5 border border-white/5 hover:bg-white/10 text-white h-14 rounded-2xl gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-orange-400/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">New Expense</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest">Update Intelligence</div>
                  </div>
                </Button>
              </Link>
              <Link href="/planner">
                <Button className="w-full justify-start bg-white/5 border border-white/5 hover:bg-white/10 text-white h-14 rounded-2xl gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Schedule Mission</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest">Draft Flight Plan</div>
                  </div>
                </Button>
              </Link>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Recent Internal Logs</h3>
            <div className="space-y-3">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-white italic line-clamp-2 underline decoration-primary/50 underline-offset-4">
                  "Ready to recharge this weekend. Need to focus on nature..."
                </div>
                <div className="text-[10px] text-white/30 uppercase font-bold">Log Entry • 2h ago</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" }) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-xs transition-colors",
      variant === "outline" ? "border border-white/10" : "bg-primary text-white",
      className
    )}>
      {children}
    </span>
  )
}
