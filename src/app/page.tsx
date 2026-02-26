"use client";

import { useMemo, useEffect, useState } from 'react';
import { useAppStore } from '@/store';
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
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_EVENTS, DiscoveryEvent } from '@/lib/data';
import { Badge } from "@/components/ui/badge";
import { getLocalWeekendSummary, getLocalEngagementSummary } from "@/services/analytics-service";
import { getLocalGamificationSummary } from "@/services/gamification-service";
import { getLocalRecommendations } from "@/services/recommendation-service";

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
    <div className="flex gap-4 font-mono text-3xl md:text-5xl font-extralight tracking-widest text-slate-900">
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase font-bold tracking-tighter text-slate-400">Days</span>
      </div>
      <span className="text-slate-300">:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase font-bold tracking-tighter text-slate-400">Hrs</span>
      </div>
      <span className="text-slate-300">:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.mins).padStart(2, '0')}</span>
        <span className="text-[10px] uppercase font-bold tracking-tighter text-slate-400">Min</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const {
    userProfile,
    currentUserEmail,
    expenses,
    weeklySavingsGoal,
    activities,
    history,
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

  const weekendSummary = useMemo(
    () =>
      getLocalWeekendSummary({
        activities,
        expenses,
        weeklySavingsGoal,
      }),
    [activities, expenses, weeklySavingsGoal]
  );

  const engagementSummary = useMemo(
    () => getLocalEngagementSummary({ history }),
    [history]
  );

  const gamification = useMemo(
    () => getLocalGamificationSummary({ activities, history }),
    [activities, history]
  );

  const availableHours = useMemo(() => {
    const idealWeekendHours = 16; // two 8-hour blocks as a soft target
    return Math.max(idealWeekendHours - weekendSummary.totalHoursPlanned, 0);
  }, [weekendSummary.totalHoursPlanned]);

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
  }, [userProfile, initializedEventIds, activities]);

  const trendingEvents = useMemo(() => {
    return MOCK_EVENTS.filter(e => !curatedEvents.some(ce => ce.id === e.id))
      .map(event => ({
        ...event,
        isInitialized: activities.some(a => a.originalEventId === event.id)
      })).slice(0, 3);
  }, [curatedEvents, activities]);

  const smartSuggestions = useMemo(
    () =>
      getLocalRecommendations({
        userProfile: userProfile ?? null,
        activities,
        expenses,
        weeklySavingsGoal,
        availableHours,
      }),
    [userProfile, activities, expenses, weeklySavingsGoal, availableHours]
  );

  const saveGoal = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val)) {
      setWeeklySavingsGoal(val);
      setIsEditingGoal(false);
    }
  };

  if (authLoading || (user && !currentUserEmail)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-400 animate-pulse">Loading your dashboard...</div>
      </div>
    );
  }

  if (!user && !currentUserEmail) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold uppercase tracking-[0.25em] mb-4">
            <Sparkles className="w-4 h-4" />
            Your weekend, gently organized
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 tracking-tight leading-tight">
            Escape the ordinary,{" "}
            <span className="text-primary">without burning out.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed px-4">
            Escapade is a calm weekend companion that balances time, budget, and energy
            so you can look forward to your days off—without spreadsheets or stress.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold tracking-wide text-xs h-12 px-8 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.12)] group">
              Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsLoginModalOpen(true)}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs h-12 px-8 rounded-2xl"
          >
            I already have an account
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12 border-t border-slate-200 pt-12">
          {[
            { icon: Target, title: "Gentle planning", desc: "A simple weekend canvas for time, energy, and money." },
            { icon: Wallet, title: "Kind-to-you budgeting", desc: "Stay mindful of money with soft nudges, not alarms." },
            { icon: Compass, title: "Discovery that fits", desc: "Ideas that match your mood, budget, and free hours." }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="space-y-4 p-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-primary mx-auto md:mx-0">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
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
    <div className="space-y-10 py-6">
      {/* Header / Mode Indicator */}
      <header className="space-y-2 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-semibold uppercase tracking-wide text-primary"
        >
          {isSavingMode ? (
            <>
              <ShieldCheck className="w-3 h-3" />
              Weekday mode · building your weekend fund
            </>
          ) : (
            <>
              <Rocket className="w-3 h-3" />
              Weekend mode · time to enjoy
            </>
          )}
        </motion.div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
              {isSavingMode ? "Plan the weekend you need." : "Enjoy the weekend you planned."}
            </h1>
            <p className="text-sm text-slate-500">
              Welcome back, {userProfile.name}. Here’s how your time and budget are shaping up.
            </p>
          </div>
          {isSavingMode && (
            <div className="flex flex-col items-end">
              <p className="text-[10px] uppercase font-semibold tracking-[0.25em] text-slate-400 mb-2">
                Next weekend in
              </p>
              <CountdownTimer targetDate={nextFriday} />
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Primary Column */}
        <div className="md:col-span-8 space-y-8">
          {/* Weekend snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="glass">
              <CardContent className="p-4 space-y-2">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  Available hours
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {availableHours.toFixed(0)}h
                </p>
                <p className="text-xs text-slate-500">
                  Based on your current plans, you still have room to breathe.
                </p>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 space-y-2">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  Weekend completion
                </p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-semibold text-slate-900">
                    {weekendSummary.completionRate.toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-500">
                    {weekendSummary.completedActivities}/{weekendSummary.totalActivities} done
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass">
              <CardContent className="p-4 space-y-2">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  Planning streak
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {engagementSummary.planningStreak}
                </p>
                <p className="text-xs text-slate-500">
                  weekends in a row with at least one plan.
                </p>
              </CardContent>
            </Card>
          </div>
          {isSavingMode ? (
            /* Discovery Showcase */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Top Matched Escapades</h2>
                <Link href="/discover" className="text-[10px] font-bold text-primary flex items-center gap-2 group tracking-widest uppercase">
                  EXPLORE ALL <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {curatedEvents.map((event) => (
                  <Card key={event.id} className="glass border-slate-200 hover:border-primary/20 transition-all overflow-hidden relative group">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {event.icon}
                        </div>
                        <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest">
                          {event.priority > 2 ? 'Elite Match' : 'Recommended'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-slate-900 leading-tight">{event.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          <Compass className="w-3 h-3" /> {event.location}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="text-lg font-bold text-slate-900">${event.cost}</div>
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
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 cursor-default"
                              : "bg-primary hover:bg-primary/90 text-white"
                          )}
                        >
                          {event.isInitialized ? (
                            <span className="flex items-center gap-2">
                              <Check className="w-3 h-3" /> Added
                            </span>
                          ) : "Add Activity"}
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
                <h2 className="text-xl font-semibold text-slate-900">This weekend&apos;s plan</h2>
                <Link href="/planner" className="text-xs font-semibold text-primary flex items-center gap-2 group">
                  Open planner <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {activities.length > 0 ? activities.slice(0, 3).map((act) => (
                  <Card key={act.id} className="glass hover:bg-slate-50 transition-all cursor-pointer group">
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
                          <h4 className="font-semibold text-slate-900">{act.title}</h4>
                          <p className="text-xs text-slate-500 font-medium">{act.date} • {act.startTime}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-slate-200 text-[10px] text-slate-500 uppercase font-semibold tracking-wide">
                        {act.category}
                      </Badge>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl space-y-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Compass className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-500">No activities scheduled yet.</p>
                    <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50">
                      Start a simple plan
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
                <h2 className="text-xl font-semibold text-slate-900 underline decoration-emerald-300/60 underline-offset-8">
                  Ideas other people love
                </h2>
                <div className="text-[10px] font-medium text-emerald-500 flex items-center gap-2 tracking-wide uppercase">
                  <Zap className="w-3 h-3" /> Popular right now
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {trendingEvents.map((event) => (
                  <Card key={event.id} className="glass hover:border-emerald-300/40 transition-all overflow-hidden relative group">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="text-xl">{event.icon}</div>
                        <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wide">
                          {event.category}
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-sm leading-tight line-clamp-1">{event.title}</h4>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div className="text-sm font-semibold text-slate-700">${event.cost}</div>
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
                            "h-7 px-3 rounded-lg text-[9px] font-semibold uppercase tracking-wide transition-all",
                            event.isInitialized
                              ? "text-emerald-500 bg-emerald-50"
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
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Smart suggestions
            </h3>
            <Card className="glass">
              <CardContent className="p-4 space-y-3">
                {smartSuggestions.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    As you add preferences, activities, and a savings goal, this panel will start
                    suggesting weekends that fit your life.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {smartSuggestions.slice(0, 3).map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {item.location} · ${item.cost}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.reason}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
          {isSavingMode && (
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Escapade fund
              </h3>
              <Card className="glass border-primary/10 bg-primary/5 overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-semibold tracking-wide text-primary">
                        Remaining this week
                      </div>
                      <div className="text-3xl font-semibold font-mono text-slate-900">
                        ${savingsRemaining.toFixed(0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold tracking-wide text-slate-400">
                        Weekly goal
                      </div>
                      <div className="text-lg font-semibold text-slate-800">
                        ${weeklySavingsGoal.toFixed(0)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-medium uppercase tracking-wide text-slate-500">
                      <span>Progress</span>
                      <span>{savingsProgress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${savingsProgress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                  <Link href="/budget">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-600 hover:text-slate-900 hover:bg-white h-8"
                    >
                      Manage Budget <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </section>
          )}

          <section className="space-y-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quick actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/budget">
                <Button className="w-full justify-start bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 h-14 rounded-2xl gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">New Expense</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                      Capture something you spent
                    </div>
                  </div>
                </Button>
              </Link>
              <Link href="/planner">
                <Button className="w-full justify-start bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 h-14 rounded-2xl gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Add an activity</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                      Block time for something that matters
                    </div>
                  </div>
                </Button>
              </Link>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              A little reflection
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="text-xs font-medium text-slate-700 italic line-clamp-2">
                  "Ready to recharge this weekend. Need to focus on nature..."
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-medium">
                  Example journal note • you can add your own from the planner
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

