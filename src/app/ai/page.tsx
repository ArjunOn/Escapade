"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/store";
import { Sparkles, Send, Bot, User, RefreshCw, Calendar, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Message { role: "user" | "assistant"; content: string; timestamp: Date; }

const STARTER_PROMPTS = [
  "Plan my perfect Saturday with $50",
  "What free events are happening this weekend?",
  "I have Sunday afternoon free — what should I do?",
  "Find me outdoor activities under $30",
];

export default function AIPage() {
  const { userProfile, weeklySavingsGoal, expenses, activities } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: `Hi ${userProfile?.name?.split(" ")[0] || "there"}! 👋 I'm your Escapade AI planner. I know what events are happening near you, your budget, and your interests. Ask me anything — like "Plan my Saturday" or "What can I do with $40 this weekend?"`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const budgetRemaining = Math.max((weeklySavingsGoal || 0) - totalSpent, 0);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Fetch nearby events for context
      const evRes = await fetch("/api/events?lat=42.3314&lng=-83.0458&days=14&limit=20");
      const evData = evRes.ok ? await evRes.json() : { events: [] };

      const res = await fetch("/api/ai/plan-weekend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          preferences: userProfile?.preferences || [],
          vibes: userProfile?.vibes || [],
          weeklyBudget: weeklySavingsGoal,
          totalSpent,
          budgetRemaining,
          nearbyEvents: evData.events.slice(0, 15).map((e: any) => ({
            title: e.title, date: e.startDateTime, cost: e.cost,
            isFree: e.isFree, location: e.locationName, category: e.category, url: e.url,
          })),
          currentActivities: activities.map(a => ({ title: a.title, date: a.date, cost: a.cost })),
          conversationHistory: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(m => [...m, { role: "assistant", content: data.plan || data.message || "Sorry, I couldn't generate a plan.", timestamp: new Date() }]);
      } else {
        setMessages(m => [...m, { role: "assistant", content: "Hmm, something went wrong. Try again in a moment.", timestamp: new Date() }]);
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Connection issue. Make sure the AI provider is configured in your .env.local.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="page-header">AI Planner</h1>
          <p className="page-subtitle">Powered by real events near you</p>
        </div>
        {/* Context pills */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-alt)] text-xs text-[var(--color-text-secondary)]">
            <DollarSign className="w-3 h-3 text-[var(--color-success)]" /> ${budgetRemaining} left
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-alt)] text-xs text-[var(--color-text-secondary)]">
            <Calendar className="w-3 h-3 text-[var(--color-primary)]" /> {activities.length} activities
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
              msg.role === "assistant" ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]"
            )}>
              {msg.role === "assistant" ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={cn(
              "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
              msg.role === "assistant"
                ? "bg-white border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-tl-sm"
                : "bg-[var(--color-primary)] text-white rounded-tr-sm"
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={cn("text-[10px] mt-1.5", msg.role === "assistant" ? "text-[var(--color-text-muted)]" : "text-white/60")}>
                {format(msg.timestamp, "h:mm a")}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-[var(--color-border)] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Starter prompts */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {STARTER_PROMPTS.map(p => (
            <button key={p} onClick={() => send(p)}
              className="px-3 py-1.5 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] text-xs font-medium hover:bg-[var(--color-primary-light)] transition-colors">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mt-auto pt-3 border-t border-[var(--color-border)]">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }}}
          placeholder="Ask me to plan your weekend, find events, or check your budget..."
          className="flex-1 px-4 py-3 rounded-2xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
          disabled={loading}
        />
        <button
          onClick={() => send(input)} disabled={loading || !input.trim()}
          className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
