"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, Wand2 } from "lucide-react";

export default function AiCompanionPage() {
  const { userProfile, activities, expenses, weeklySavingsGoal, history } = useAppStore();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    setIsGenerating(true);
    setError(null);

    if (!userProfile) {
      setError("Complete onboarding to unlock AI planning.");
      setIsGenerating(false);
      return;
    }

    try {
      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const response = await fetch("/api/ai/plan-weekend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences: userProfile.preferences || [],
          vibes: userProfile.vibes || [],
          currentActivities: activities,
          weeklyBudget: weeklySavingsGoal || 0,
          totalSpent,
          availableHours: 16,
          recentHistory: history || [],
          prompt: input,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError(data.message || "Upgrade required.");
        } else {
          throw new Error(data.message || "Failed to generate plan");
        }
        return;
      }

      setResponse(data.plan);
    } catch (err: any) {
      setError(err.message || "Failed to generate weekend plan");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900\">AI Companion</h1>
        <p className="text-sm text-slate-500">
          Describe your ideal weekend in natural language, and I'll suggest activities and a budget breakdown that fits your vibe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Bot className="w-4 h-4 text-primary" />
              Describe your weekend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="“Sunset walk, one nice dinner, mostly low-cost, somewhere calm…”"
              className="min-h-[140px] resize-none"
            />
            <Button
              type="button"
              onClick={handleAsk}
              className="inline-flex items-center gap-2"
              disabled={isGenerating}
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Planning..." : "Plan my weekend"}
            </Button>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <p className="text-xs text-slate-500">
              This flow now calls the server-side AI endpoint so you can swap providers without
              touching the UI.
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Wand2 className="w-4 h-4 text-accent" />
              Companion reply
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[16px] bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 min-h-[120px] whitespace-pre-line">
              {response ??
                "Ask for any kind of weekend—budget-friendly, outdoorsy, social, or slow and restorative—and I’ll suggest a gentle starting point."}
            </div>
            <p className="text-xs text-slate-500">
              If AI is disabled, you will see a friendly error here until the provider is enabled.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

