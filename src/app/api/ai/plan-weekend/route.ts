import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateWeekendPlan } from '@/services/ai-provider'
import prisma from '@/lib/db-utils'
import { isFeatureEnabled } from '@/lib/feature-flags'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Feature gate check
    const hasAccess = await isFeatureEnabled(user.id, 'ai-companion')
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Upgrade required',
          message: 'AI planning is available on Pro and Team plans',
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      )
    }

    // Get user profile and context
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get weekend context
    const body = await request.json()
    const context = {
      userId: user.id,
      userName: userProfile.name,
      preferences: body.preferences || [],
      vibes: body.vibes || [],
      currentWeekendActivities: body.currentActivities || [],
      weeklyBudget: body.weeklyBudget || 100,
      totalSpentThisWeek: body.totalSpent || 0,
      availableHours: body.availableHours || 16,
      recentHistory: body.recentHistory || [],
    }

    // Generate plan
    const planContent = await generateWeekendPlan(context)

    // Log to database
    await prisma.aiLog.create({
      data: {
        userId: user.id,
        prompt: JSON.stringify(context),
        response: planContent,
      },
    })

    return NextResponse.json({
      success: true,
      plan: planContent,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[API] Weekend plan error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate plan',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
