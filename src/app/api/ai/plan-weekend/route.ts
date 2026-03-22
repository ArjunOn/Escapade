import { NextRequest, NextResponse } from "next/server";
import { generateWeekendPlan, generateAIResponse } from "@/services/ai-provider";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Fetch nearby events to enrich AI context
    let nearbyEvents: any[] = [];
    try {
      const lat = body.lat ?? 42.3314;
      const lng = body.lng ?? -83.0458;
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const evRes = await fetch(
        `${baseUrl}/api/events?lat=${lat}&lng=${lng}&days=14&limit=20`,
        { next: { revalidate: 3600 } }
      );
      if (evRes.ok) {
        const evData = await evRes.json();
        nearbyEvents = (evData.events || []).map((e: any) => ({
          title: e.title,
          date: e.startDateTime,
          cost: e.cost ?? 0,
          isFree: e.isFree ?? false,
          location: e.locationName ?? e.city ?? null,
          category: e.category ?? null,
          url: e.url,
        }));
      }
    } catch (e) {
      console.warn("[AI Route] Could not fetch nearby events:", e);
    }

    const budgetRemaining = body.budgetRemaining ??
      Math.max((body.weeklyBudget || 100) - (body.totalSpent || 0), 0);

    // Build events context block for system prompt
    const eventsBlock = nearbyEvents.length > 0
      ? `\n\nReal events happening nearby:\n${nearbyEvents.slice(0, 12).map((e: any) =>
          `- ${e.title} | ${e.isFree ? "Free" : `$${e.cost}`} | ${e.location || "Online"} | ${new Date(e.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
        ).join("\n")}`
      : "";

    let planContent: string;

    // Conversational chat mode (from AI page)
    if (body.message) {
      const response = await generateAIResponse({
        messages: [
          {
            role: "system",
            content: `You are Escapade, a warm and practical weekend event planner. You know about real local events near the user. Budget remaining this week: $${budgetRemaining}. User interests: ${(body.preferences || []).join(", ") || "open to anything"}.${eventsBlock}\n\nBe concise, friendly, and reference real events by name when they fit. Keep responses under 300 words.`,
          },
          ...(body.conversationHistory || []),
          { role: "user" as const, content: body.message },
        ],
        temperature: 0.8,
        maxTokens: 600,
      });
      planContent = response.content;
    } else {
      // Full weekend plan mode
      const context = {
        userId: body.userId || "anonymous",
        userName: body.userName || body.name || "Explorer",
        preferences: body.preferences || [],
        vibes: body.vibes || [],
        currentWeekendActivities: body.currentActivities || [],
        weeklyBudget: body.weeklyBudget || 100,
        totalSpentThisWeek: body.totalSpent || 0,
        availableHours: body.availableHours || 16,
        recentHistory: body.recentHistory || [],
        nearbyEvents,
      };
      planContent = await generateWeekendPlan(context);
    }

    return NextResponse.json({
      success: true,
      plan: planContent,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[AI Route] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate plan", message: error.message },
      { status: 500 }
    );
  }
}
