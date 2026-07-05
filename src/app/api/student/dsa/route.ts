import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getProfileId(userId: string) {
  const p = await prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } });
  return p?.id;
}

// Spaced repetition interval calculator
function getNextRevisionDate(currentStep: number): Date | null {
  const now = new Date();
  switch (currentStep) {
    case 1: // Finished 1-day review -> schedule for 3 days later
      now.setDate(now.getDate() + 3);
      return now;
    case 2: // Finished 3-day review -> schedule for 7 days later
      now.setDate(now.getDate() + 7);
      return now;
    case 3: // Finished 7-day review -> schedule for 15 days later
      now.setDate(now.getDate() + 15);
      return now;
    case 4: // Finished 15-day review -> schedule for 30 days later
      now.setDate(now.getDate() + 30);
      return now;
    case 5: // Finished 30-day review -> done with revision cycle!
      return null;
    default:
      return null;
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const problems = await prisma.dsaProblem.findMany({
    where: { studentId },
    orderBy: { solvedAt: "desc" },
  });

  // Calculate difficulty counts
  const byDifficulty = {
    EASY: problems.filter((p) => p.difficulty === "EASY").length,
    MEDIUM: problems.filter((p) => p.difficulty === "MEDIUM").length,
    HARD: problems.filter((p) => p.difficulty === "HARD" || p.difficulty === "EXPERT").length,
  };

  const accepted = problems.filter((p) => p.accepted).length;
  const acceptanceRate = problems.length > 0 ? Math.round((accepted / problems.length) * 100) : 0;

  // Average time & Fastest solve
  const timedProbs = problems.filter((p) => p.timeTaken && p.timeTaken > 0);
  const avgTime = timedProbs.length > 0 
    ? Math.round(timedProbs.reduce((acc, p) => acc + (p.timeTaken || 0), 0) / timedProbs.length) 
    : 0;
  const fastestSolve = timedProbs.length > 0
    ? Math.min(...timedProbs.map(p => p.timeTaken || 999))
    : 0;

  // Streaks calculation
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { codingStreak: true, lastCodingDate: true },
  });
  const currentStreak = profile?.codingStreak || 0;

  // Longest streak calculation from database timestamps
  let longestStreak = currentStreak;
  if (problems.length > 0) {
    const dates = Array.from(new Set(
      problems.map(p => new Date(p.solvedAt).toDateString())
    )).map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const d of dates) {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diff = (prevDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
        } else if (diff > 1) {
          if (tempStreak > longestStreak) longestStreak = tempStreak;
          tempStreak = 1;
        }
      }
      prevDate = d;
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }

  // Topic distribution
  const topicBreakdown: Record<string, number> = {};
  problems.forEach((p) => {
    topicBreakdown[p.topic] = (topicBreakdown[p.topic] || 0) + 1;
  });

  // Monthly activity chart helper (grouped by month-year string)
  const monthlyActivityMap: Record<string, number> = {};
  const weeklyActivityMap: Record<string, number> = {};
  
  // Last 7 days helper
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weeklyActivityMap[d.toLocaleDateString(undefined, { weekday: "short" })] = 0;
  }

  problems.forEach((p) => {
    const pDate = new Date(p.solvedAt);
    
    // Group monthly
    const monthKey = pDate.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
    monthlyActivityMap[monthKey] = (monthlyActivityMap[monthKey] || 0) + 1;

    // Group weekly (last 7 days)
    const dayName = pDate.toLocaleDateString(undefined, { weekday: "short" });
    if (weeklyActivityMap[dayName] !== undefined) {
      // Check if it was solved in the last 7 days
      const diffTime = Math.abs(new Date().getTime() - pDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        weeklyActivityMap[dayName] += 1;
      }
    }
  });

  const monthlyActivity = Object.keys(monthlyActivityMap).map(key => ({
    month: key,
    solved: monthlyActivityMap[key]
  })).reverse().slice(-6); // Last 6 months

  const weeklyActivity = Object.keys(weeklyActivityMap).map(key => ({
    day: key,
    solved: weeklyActivityMap[key]
  }));

  // Spaced repetition reminders (due date is past or today)
  const now = new Date();
  const revisionReminders = problems.filter((p) => {
    if (!p.nextReviewAt) return false;
    return new Date(p.nextReviewAt) <= now;
  });

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return NextResponse.json({
    problems,
    revisionReminders,
    stats: {
      total: problems.length,
      byDifficulty,
      acceptanceRate,
      daily: problems.filter((p) => new Date(p.solvedAt) >= today).length,
      weekly: problems.filter((p) => new Date(p.solvedAt) >= weekAgo).length,
      monthly: problems.filter((p) => new Date(p.solvedAt) >= monthAgo).length,
      avgTime,
      fastestSolve,
      currentStreak,
      longestStreak,
      topicBreakdown,
      monthlyActivity,
      weeklyActivity
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    
    // Calculate the first revision date (scheduled 1 day from now)
    const firstReviewDate = new Date();
    firstReviewDate.setDate(firstReviewDate.getDate() + 1);

    const problem = await prisma.dsaProblem.create({
      data: {
        studentId,
        platform: body.platform,
        title: body.title,
        topic: body.topic,
        difficulty: body.difficulty,
        timeTaken: body.timeTaken ? Number(body.timeTaken) : null,
        url: body.url || null,
        language: body.language || null,
        code: body.code || null,
        notes: body.notes || null,
        
        // AI Review fields
        aiScore: body.aiScore ? Number(body.aiScore) : null,
        aiTimeComplexity: body.aiTimeComplexity || null,
        aiSpaceComplexity: body.aiSpaceComplexity || null,
        aiOptimal: body.aiOptimal !== undefined ? Boolean(body.aiOptimal) : null,
        aiCodeQuality: body.aiCodeQuality || null,
        aiReadability: body.aiReadability || null,
        aiNaming: body.aiNaming || null,
        aiMemoryUsage: body.aiMemoryUsage || null,
        aiReadiness: body.aiReadiness || null,
        aiEdgeCases: body.aiEdgeCases || null,
        aiSuggestions: body.aiSuggestions || null,

        // Revision
        revisionStep: 1, // First milestone scheduled
        nextReviewAt: firstReviewDate
      }
    });

    // Update student's daily solving streak
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const profile = await prisma.studentProfile.findUnique({ where: { id: studentId } });
    let streak = profile?.codingStreak || 0;
    const lastCoding = profile?.lastCodingDate;
    if (lastCoding) {
      const last = new Date(lastCoding); last.setHours(0, 0, 0, 0);
      const diff = (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak += 1;
      else if (diff > 1) streak = 1;
    } else streak = 1;

    // Increment points/XP
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { 
        xp: { increment: 15 }, 
        coins: { increment: 3 }, 
        codingStreak: streak, 
        lastCodingDate: today 
      },
    });

    return NextResponse.json({ problem });
  } catch (error) {
    console.error("POST DSA Error:", error);
    return NextResponse.json({ error: "Failed to log problem" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: "Problem ID is required" }, { status: 400 });
    }

    const existing = await prisma.dsaProblem.findUnique({ where: { id } });
    if (!existing || existing.studentId !== studentId) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Spaced repetition progression
    if (action === "revision") {
      const nextStep = Math.min(existing.revisionStep + 1, 5);
      const nextReview = getNextRevisionDate(existing.revisionStep);

      const updated = await prisma.dsaProblem.update({
        where: { id },
        data: {
          revisionStep: nextStep,
          nextReviewAt: nextReview
        }
      });
      return NextResponse.json(updated);
    }

    // Standard field edit
    const updated = await prisma.dsaProblem.update({
      where: { id },
      data: {
        title: body.title,
        platform: body.platform,
        topic: body.topic,
        difficulty: body.difficulty,
        timeTaken: body.timeTaken ? Number(body.timeTaken) : null,
        url: body.url || null,
        language: body.language || null,
        code: body.code || null,
        notes: body.notes || null,

        // AI Review fields
        aiScore: body.aiScore ? Number(body.aiScore) : undefined,
        aiTimeComplexity: body.aiTimeComplexity || undefined,
        aiSpaceComplexity: body.aiSpaceComplexity || undefined,
        aiOptimal: body.aiOptimal !== undefined ? Boolean(body.aiOptimal) : undefined,
        aiCodeQuality: body.aiCodeQuality || undefined,
        aiReadability: body.aiReadability || undefined,
        aiNaming: body.aiNaming || undefined,
        aiMemoryUsage: body.aiMemoryUsage || undefined,
        aiReadiness: body.aiReadiness || undefined,
        aiEdgeCases: body.aiEdgeCases || undefined,
        aiSuggestions: body.aiSuggestions || undefined,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT DSA Error:", error);
    return NextResponse.json({ error: "Failed to update problem log" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Problem ID is required" }, { status: 400 });
  }

  try {
    const existing = await prisma.dsaProblem.findUnique({ where: { id } });
    if (!existing || existing.studentId !== studentId) {
      return NextResponse.json({ error: "Problem not found or unauthorized" }, { status: 404 });
    }

    await prisma.dsaProblem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE DSA Error:", error);
    return NextResponse.json({ error: "Failed to delete problem log" }, { status: 400 });
  }
}
