"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store";
import type { UserProfile } from "@/lib/types";
import {
  Compass, Check, ArrowRight, ArrowLeft,
  Zap, Coffee, Users, Music, Palette, Mountain,
  DollarSign, Wallet, Crown, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

const VIBES = [
  { value: "Outdoor",    icon: Mountain, color: "#2e7d32", desc: "Nature & fresh air"     },
  { value: "Social",     icon: Users,    color: "#7b1fa2", desc: "People & connection"    },
  { value: "Relaxation", icon: Coffee,   color: "#e64a19", desc: "Calm & recharge"        },
  { value: "Culture",    icon: Music,    color: "#1565c0", desc: "Arts & heritage"        },
  { value: "Sports",     icon: Zap,      color: "#f57c00", desc: "Active & energetic"     },
  { value: "Creative",   icon: Palette,  color: "#00838f", desc: "Make & explore"         },
];

const BUDGETS = [
  { id: "frugal",   icon: DollarSign, label: "Budget-friendly", desc: "Maximize fun per dollar — mostly free & cheap events", range: "Under $30/week" },
  { id: "moderate", icon: Wallet,     label: "Balanced",         desc: "Mix of free and paid — good quality without splurging", range: "$30–100/week"   },
  { id: "luxury",   icon: Crown,      label: "Premium",          desc: "Best experiences money can buy — price is secondary", range: "$100+/week"    },
];

const INTERESTS = [
  "Hiking", "Concerts", "Food Tours", "Yoga", "Art Galleries", "Sports Games",
  "Jazz", "Photography", "Theatre", "Nightlife", "Farmers Markets", "Comedy",
  "Wine Tasting", "Gaming", "Film", "Dance", "Fitness", "Cooking Classes",
  "Museums", "Outdoor Cinema", "Trivia Nights", "Volunteering",
];

const DETROIT_LOCATION = "Detroit, MI";

export default function OnboardingPage() {
  const router = useRouter();
  const { updateUserProfile } = useAppStore();

  const [step, setStep] = useState(1);
  const [vibes, setVibes] = useState<string[]>([]);
  const [budget, setBudget] = useState<UserProfile["budgetTier"]>("moderate");
  const [interests, setInterests] = useState<string[]>([]);
  const [location, setLocation] = useState(DETROIT_LOCATION);

  const toggleVibe = (v: string) =>
    setVibes(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  const toggleInterest = (t: string) =>
    setInterests(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const finish = () => {
    updateUserProfile({
      vibes, budgetTier: budget, preferences: interests,
      location, onboardingCompleted: true,
    });
    router.push("/");
  };

  const steps = [
    { num: 1, label: "Your vibe" },
    { num: 2, label: "Budget style" },
    { num: 3, label: "Interests" },
    { num: 4, label: "Location" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-[var(--color-text-primary)]">Escapade</span>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                step > s.num  ? "bg-[var(--color-primary)] text-white" :
                step === s.num ? "bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary-light)]" :
                                 "bg-[var(--color-bg-alt)] text-[var(--color-text-muted)]"
              )}>
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("w-12 h-0.5 rounded-full transition-all", step > s.num ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]")} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card p-6 space-y-5">

          {/* Step 1 — Vibe */}
          {step === 1 && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">What's your weekend vibe?</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Pick all that resonate — we'll find events that match.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {VIBES.map(v => {
                  const sel = vibes.includes(v.value);
                  return (
                    <button key={v.value} onClick={() => toggleVibe(v.value)}
                      className={cn("p-4 rounded-xl text-left border transition-all",
                        sel ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]" : "border-[var(--color-border)] bg-white hover:border-gray-300"
                      )}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                        style={{ background: v.color + "18" }}>
                        <v.icon className="w-4 h-4" style={{ color: v.color }} />
                      </div>
                      <p className={cn("text-sm font-medium", sel ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]")}>{v.value}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{v.desc}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 2 — Budget */}
          {step === 2 && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">How do you like to spend?</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">This helps us filter events to your comfort zone.</p>
              </div>
              <div className="space-y-3">
                {BUDGETS.map(b => {
                  const sel = budget === b.id;
                  return (
                    <button key={b.id} onClick={() => setBudget(b.id as UserProfile["budgetTier"])}
                      className={cn("w-full p-4 rounded-xl text-left border flex items-start gap-4 transition-all",
                        sel ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]" : "border-[var(--color-border)] bg-white hover:border-gray-300"
                      )}>
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        sel ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]"
                      )}>
                        <b.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">{b.label}</p>
                          <span className="text-xs text-[var(--color-text-muted)] font-medium">{b.range}</span>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{b.desc}</p>
                      </div>
                      {sel && <Check className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Step 3 — Interests */}
          {step === 3 && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">What are you into?</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Select your interests so we can recommend the right events.</p>
              </div>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
                {INTERESTS.map(tag => {
                  const sel = interests.includes(tag);
                  return (
                    <button key={tag} onClick={() => toggleInterest(tag)}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        sel ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                            : "bg-white border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-gray-300"
                      )}>
                      {tag}
                    </button>
                  );
                })}
              </div>
              {interests.length > 0 && (
                <p className="text-xs text-[var(--color-primary)] font-medium">{interests.length} selected</p>
              )}
            </>
          )}

          {/* Step 4 — Location */}
          {step === 4 && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Where are you based?</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">We'll find events near you using this location.</p>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="City, State (e.g. Detroit, MI)"
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Detroit, MI", "Ann Arbor, MI", "Grand Rapids, MI", "Chicago, IL", "Cleveland, OH"].map(city => (
                    <button key={city} onClick={() => setLocation(city)}
                      className={cn("px-3 py-1.5 rounded-full text-xs border transition-all",
                        location === city ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                          : "bg-white border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-gray-300"
                      )}>
                      {city}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-primary-light)] text-xs text-[var(--color-primary)] leading-relaxed">
                📍 Events from Eventbrite and Ticketmaster will be searched within 30 miles of this location.
              </div>
            </>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] transition-colors",
                step === 1 && "invisible"
              )}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && vibes.length === 0}
                className="flex items-center gap-1.5 btn-primary rounded-full px-5 py-2 text-sm disabled:opacity-50">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finish}
                className="flex items-center gap-1.5 btn-primary rounded-full px-5 py-2 text-sm">
                Let's go <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Step label */}
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Step {step} of 4 — {steps[step - 1]?.label}
        </p>
      </div>
    </div>
  );
}
