"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from '@/lib/store';
import { UserProfile } from '@/lib/types';
import { Check, ArrowRight, Sparkles, Zap, Heart, Coffee, Music, Coins, Wallet, Landmark, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const VIBE_OPTIONS = [
    { label: 'Sports', value: 'Sports', icon: Zap, desc: 'Active and high-energy' },
    { label: 'Relaxation', value: 'Relaxation', icon: Coffee, desc: 'Zen and chilled out' },
    { label: 'Social', value: 'Social', icon: Heart, desc: 'People and connection' },
    { label: 'Culture', value: 'Culture', icon: Music, desc: 'Arts and heritage' },
];

const BUDGET_PERSONAS = [
    { id: 'frugal', label: 'Frugal', icon: Coins, desc: 'Maximize fun per dollar' },
    { id: 'moderate', label: 'Moderate', icon: Wallet, desc: 'Balance of cost & quality' },
    { id: 'luxury', label: 'Luxury', icon: Landmark, desc: 'Premium experiences only' },
];

const INTEREST_TAGS = [
    'Tennis', 'Hiking', 'Concerts', 'Fine Dining', 'Surfing',
    'Museums', 'Nightlife', 'Gaming', 'Photography', 'Yoga',
    'Travel', 'Architecture', 'Cooking', 'Gardening', 'Jazz'
];

export default function OnboardingPage() {
    const router = useRouter();
    const updateUserProfile = useAppStore((state) => state.updateUserProfile);
    const userProfile = useAppStore((state) => state.userProfile);

    const [step, setStep] = useState(1);
    const [vibes, setVibes] = useState<string[]>([]);
    const [budgetTier, setBudgetTier] = useState<UserProfile['budgetTier']>('moderate');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const toggleVibe = (vibe: string) => {
        setVibes(prev => prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]);
    };

    const toggleInterest = (tag: string) => {
        setSelectedInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else handleComplete();
    };

    const handleComplete = () => {
        updateUserProfile({
            vibes,
            budgetTier,
            preferences: selectedInterests,
            onboardingCompleted: true,
            location: 'Default HQ', // Default as per prompt requirement for userProfile
        });
        router.push('/');
    };

    return (
        <div className="min-h-[90vh] flex flex-col items-center justify-center py-12 px-4 relative">
            <div className="w-full max-w-xl space-y-8 z-10">
                {/* Visual Identity Logo */}
                <div className="flex justify-center mb-4">
                    <motion.div initial={{ rotate: -10 }} animate={{ rotate: 0 }} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-2xl font-semibold tracking-tight text-slate-900">Escapade</span>
                    </motion.div>
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-between items-center mb-8 px-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-4 flex-1 last:flex-none">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border",
                                step >= s ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-500"
                            )}>
                                {step > s ? <Check className="w-4 h-4" /> : s}
                            </div>
                            {s < 3 && <div className={cn("flex-1 h-px", step > s ? "bg-primary" : "bg-slate-200")} />}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="glass border-slate-200 shadow-xl overflow-hidden min-h-[450px] flex flex-col">
                            {step === 1 && (
                                <div className="p-8 space-y-8 flex-1">
                                    <div className="space-y-2">
                                        <CardTitle className="text-3xl font-semibold text-slate-900">Choose your vibe.</CardTitle>
                                        <CardDescription className="text-slate-600 text-base">Select the atmospheres that define your weekend energy.</CardDescription>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {VIBE_OPTIONS.map((v) => {
                                            const Icon = v.icon;
                                            const isSelected = vibes.includes(v.value);
                                            return (
                                                <button
                                                    key={v.value}
                                                    onClick={() => toggleVibe(v.value)}
                                                    className={cn(
                                                        "p-5 rounded-2xl text-left transition-all border group",
                                                        isSelected
                                                            ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                                                            : "bg-white border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <Icon className={cn("w-6 h-6 mb-3 transition-colors", isSelected ? "text-primary" : "text-slate-400 group-hover:text-slate-500")} />
                                                    <div className="font-bold text-slate-900 mb-1">{v.label}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{v.desc}</div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="p-8 space-y-8 flex-1">
                                    <div className="space-y-2">
                                        <CardTitle className="text-3xl font-semibold text-slate-900">Budget Persona.</CardTitle>
                                        <CardDescription className="text-slate-600 text-base">How do you like to allocate your escapade funds?</CardDescription>
                                    </div>
                                    <div className="space-y-3">
                                        {BUDGET_PERSONAS.map((p) => {
                                            const Icon = p.icon;
                                            const isSelected = budgetTier === p.id;
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setBudgetTier(p.id as any)}
                                                    className={cn(
                                                        "w-full p-6 rounded-2xl flex items-center gap-6 text-left transition-all border",
                                                        isSelected
                                                            ? "bg-primary/10 border-primary"
                                                            : "bg-white border-slate-200 hover:border-slate-300"
                                                    )}
                                                >
                                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500")}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg text-slate-900">{p.label}</div>
                                                        <div className="text-sm text-slate-600">{p.desc}</div>
                                                    </div>
                                                    {isSelected && <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="p-8 space-y-8 flex-1">
                                    <div className="space-y-2">
                                        <CardTitle className="text-3xl font-semibold text-slate-900">Interest Tags.</CardTitle>
                                        <CardDescription className="text-slate-600 text-base">Select your core interests for personalized discovery.</CardDescription>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {INTEREST_TAGS.map((tag) => {
                                            const isSelected = selectedInterests.includes(tag);
                                            return (
                                                <button
                                                    key={tag}
                                                    onClick={() => toggleInterest(tag)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border",
                                                        isSelected
                                                            ? "bg-primary text-white border-primary"
                                                            : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                                    )}
                                                >
                                                    {tag}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="p-8 pt-0 flex justify-between items-center bg-gradient-to-t from-slate-100/60 to-transparent">
                                <Button
                                    variant="ghost"
                                    onClick={() => step > 1 && setStep(step - 1)}
                                    className={cn("text-slate-500 hover:text-slate-700", step === 1 && "opacity-0 pointer-events-none")}
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                                    disabled={step === 1 && vibes.length === 0}
                                >
                                    {step === 3 ? "Initialize Mission" : "Continue"}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
