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
import { useRouter } from 'next/navigation';
import { LoginModal } from '@/components/features/auth/LoginModal';
import { MOCK_EVENTS, DiscoveryEvent } from '@/lib/data';
import { Badge } from "@/components/ui/badge";

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
  const {
    userProfile,
    currentUserEmail,
    expenses,
    weeklySavingsGoal,
    activities,
    setWeeklySavingsGoal,
    initializeEvent,
    initializedEventIds,
    syncStore
  } = useAppStore();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (currentUserEmail) {
      syncStore();
    }
  }, [currentUserEmail, syncStore]);

  // Goal edit state
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(weeklySavingsGoal?.toString() || "0");

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

  const curatedEvents = useMemo(() => {
    if (!userProfile) return [];
    return MOCK_EVENTS.map(event => {
      const matchScore = event.tags.filter(t => userProfile.preferences.includes(t)).length;
      const vibeScore = event.vibes.filter(v => userProfile.vibes.includes(v)).length;
      const isInitialized = activities.some(a => a.originalEventId === event.id);
      return {
        ...event,
        priority: matchScore + vibeScore,
        isInitialized
      };
    }).sort((a, b) => b.priority - a.priority).slice(0, 2);
  }, [userProfile, initializedEventIds]);

  const trendingEvents = useMemo(() => {
    return MOCK_EVENTS.filter(e => !curatedEvents.some(ce => ce.id === e.id))
      .map(event => ({
        ...event,
        isInitialized: activities.some(a => a.originalEventId === event.id)
      })).slice(0, 3);
  }, [curatedEvents, activities]);

  const saveGoal = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val)) {
      setWeeklySavingsGoal(val);
      setIsEditingGoal(false);
    }
  };

  if (!currentUserEmail) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
            <Sparkles className="w-4 h-4" />
            Your Weekend, Engineered
          </div>
          <h1 className="text-5xl md:text-7xl font-serif italic text-white tracking-tight leading-tight">
            Escape the <span className="text-primary">Ordinary.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/40 font-medium leading-relaxed px-4">
            Escapade is your intelligent mission control for weekend adventures.
            Plan, discover, and budget your escapes with precision.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs h-14 px-10 rounded-2xl shadow-2xl shadow-primary/20 group">
              Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsLoginModalOpen(true)}
            className="border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-widest text-xs h-14 px-10 rounded-2xl"
          >
            Personnel Sign In
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12 border-t border-white/5 pt-12">
          {[
            { icon: Target, title: "Precision Planning", desc: "Military-grade logistics for your leisure time." },
            { icon: Wallet, title: "Budget Intelligence", desc: "Maximize your fun per dollar with smart tracking." },
            { icon: Compass, title: "Smart Discovery", desc: "Hand-picked experiences tailored to your vibe." }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="space-y-4 p-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary mx-auto md:mx-0">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{feature.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </div>
    );
  }

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
            /* Discovery Showcase */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif italic text-white underline decoration-primary/30 underline-offset-8">Top Matched Escapades</h2>
                <Link href="/discovery" className="text-[10px] font-bold text-primary flex items-center gap-2 group tracking-widest uppercase">
                  EXPLORE ALL <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {curatedEvents.map((event) => (
                  <Card key={event.id} className="glass border-white/5 hover:border-primary/20 transition-all overflow-hidden relative group">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {event.icon}
                        </div>
                        <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest">
                          {event.priority > 2 ? 'Elite Match' : 'Recommended'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-white leading-tight">{event.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                          <Compass className="w-3 h-3" /> {event.location}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="text-lg font-bold text-white">${event.cost}</div>
                        <Button
                          size="sm"
                          disabled={event.isInitialized}
                          onClick={() => !event.isInitialized && initializeEvent({
                            id: event.id,
                            title: event.title,
                            category: event.category as any,
                            cost: event.cost,
                            date: event.date,
                            time: event.time,
                            location: event.location
                          })}
                          className={cn(
                            "h-8 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            event.isInitialized
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                              : "bg-primary hover:bg-primary/90 text-white"
                          )}
                        >
                          {event.isInitialized ? (
                            <span className="flex items-center gap-2">
                              <Check className="w-3 h-3" /> Ready
                            </span>
                          ) : "Initialize"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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

          {/* Discovery / Showcase Sections */}
          <div className="space-y-12">
            {/* Top Matched (already there) */}

            {/* Trending Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif italic text-white underline decoration-emerald-500/30 underline-offset-8">Trending Expeditions</h2>
                <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-2 tracking-widest uppercase">
                  <Zap className="w-3 h-3" /> High Interaction
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {trendingEvents.map((event) => (
                  <Card key={event.id} className="glass border-white/5 hover:border-emerald-500/20 transition-all overflow-hidden relative group">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="text-xl">{event.icon}</div>
                        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{event.category}</div>
                      </div>
                      <h4 className="font-bold text-white text-sm leading-tight line-clamp-1">{event.title}</h4>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="text-sm font-bold text-white/60">${event.cost}</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={event.isInitialized}
                          onClick={() => !event.isInitialized && initializeEvent({
                            id: event.id,
                            title: event.title,
                            category: event.category as any,
                            cost: event.cost,
                            date: event.date,
                            time: event.time,
                            location: event.location
                          })}
                          className={cn(
                            "h-7 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                            event.isInitialized
                              ? "text-emerald-400 bg-emerald-400/10"
                              : "text-primary hover:bg-primary/10"
                          )}
                        >
                          {event.isInitialized ? <Check className="w-3 h-3" /> : "Add"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column (Quick Actions / Stats) */}
        <div className="md:col-span-4 space-y-8">
          {isSavingMode && (
            <section className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Escapade Fund</h3>
              <Card className="glass border-primary/20 bg-primary/5 overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-primary">Target Remaining</div>
                      <div className="text-3xl font-bold font-mono text-white">${savingsRemaining.toFixed(0)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-white/40">Goal</div>
                      <div className="text-lg font-bold text-white">${weeklySavingsGoal.toFixed(0)}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-white/40">
                      <span>Progress</span>
                      <span>{savingsProgress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${savingsProgress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                  <Link href="/budget">
                    <Button variant="ghost" size="sm" className="w-full mt-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 h-8">
                      Manage Budget <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          )}

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

