"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { getLocalRecommendations } from "@/services/recommendation-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, Wand2 } from "lucide-react";

export default function AiCompanionPage() {
  const { userProfile, activities, expenses, weeklySavingsGoal } = useAppStore();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);

  const handleAsk = () => {
    const recommendations = getLocalRecommendations({
      userProfile,
      activities,
      expenses,
      weeklySavingsGoal,
      availableHours: 8,
    });

    const top = recommendations[0];
    const suggestion = top
      ? `How about "${top.title}" in ${top.location}? It ${top.reason.toLowerCase()}.`
      : "Once you add a few preferences and a budget, I’ll start suggesting weekends that fit you.";

    const baseIntro =
      "This is a mock companion today, ready for a future AI brain tomorrow.";

    setResponse(`${baseIntro}\n\n${suggestion}`);
  };

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-2">
        <h1>AI companion (coming soon)</h1>
        <p className="text-sm text-slate-500">
          Draft natural language plans like “low-budget cozy weekend with friends”, and Escapade
          will turn it into activities and budget suggestions.
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
            >
              <Sparkles className="w-4 h-4" />
              Mock plan my weekend
            </Button>
            <p className="text-xs text-slate-500">
              Under the hood, this page is wired to the recommendation engine and is ready to swap
              in a real OpenAI call.
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
              To plug in a live model, replace the mock handler with an API route that calls your
              provider of choice and passes in the same context.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

