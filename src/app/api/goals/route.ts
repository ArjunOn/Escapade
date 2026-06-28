import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const goals = await db.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ goals });
  } catch (e) {
    console.error("GET /api/goals error:", e);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description, type, category, targetValue, unit, deadline } = body;

    if (!title || !type || !targetValue || !unit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure user record exists in DB
    await db.user.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id, email: user.email ?? "", name: user.user_metadata?.name ?? user.email ?? "User" },
    });

    const goal = await db.goal.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        type,
        category: category || null,
        targetValue: Number(targetValue),
        currentValue: 0,
        unit,
        deadline: deadline ? new Date(deadline) : null,
        status: "active",
      },
    });
    return NextResponse.json({ goal }, { status: 201 });
  } catch (e) {
    console.error("POST /api/goals error:", e);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
