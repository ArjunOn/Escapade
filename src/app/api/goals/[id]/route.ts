import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const goal = await db.goal.findUnique({ where: { id } });
    if (!goal || goal.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const updated = await db.goal.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.currentValue !== undefined && { currentValue: Number(body.currentValue) }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.deadline !== undefined && { deadline: body.deadline ? new Date(body.deadline) : null }),
      },
    });
    return NextResponse.json({ goal: updated });
  } catch (e) {
    console.error("PATCH /api/goals/[id] error:", e);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const goal = await db.goal.findUnique({ where: { id } });
    if (!goal || goal.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await db.goal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/goals/[id] error:", e);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
