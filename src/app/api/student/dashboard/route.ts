import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculatePlacementReadiness } from "@/lib/scoring";
import { generateAiSuggestions } from "@/lib/ai/mentor";

// Utility to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

async function getStudentData(userId: string) {
  if (!isValidObjectId(userId)) return null;

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        projects: true,
        certifications: true,
        dsaProblems: { orderBy: { solvedAt: "desc" } },
        aptitudeTests: { orderBy: { takenAt: "desc" } },
        mockInterviews: { orderBy: { conductedAt: "desc" } },
        resumes: { orderBy: { createdAt: "desc" } },
        achievements: { include: { achievement: true } },
        weeklyGoals: { where: { completed: false }, orderBy: { dueDate: "asc" }, take: 5 },
        aiSuggestions: { where: { read: false }, orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
    return profile;
  } catch (error) {
    console.error("Error in getStudentData query:", error);
    return null;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isValidObjectId(session.userId)) {
      return NextResponse.json({ error: "Invalid session token format" }, { status: 401 });
    }

    const profile = await getStudentData(session.userId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Defensive default fallbacks
    profile.skills = profile.skills || [];
    profile.projects = profile.projects || [];
    profile.certifications = profile.certifications || [];
    profile.dsaProblems = profile.dsaProblems || [];
    profile.aptitudeTests = profile.aptitudeTests || [];
    profile.mockInterviews = profile.mockInterviews || [];
    profile.resumes = profile.resumes || [];
    profile.achievements = profile.achievements || [];
    profile.weeklyGoals = profile.weeklyGoals || [];
    profile.aiSuggestions = profile.aiSuggestions || [];

    const scores = calculatePlacementReadiness(profile as any);
    const suggestions = generateAiSuggestions(profile as any);

    const allStudents = await prisma.studentProfile.findMany({
      select: { id: true, xp: true },
      orderBy: { xp: "desc" },
    });
    const rank = allStudents.findIndex((s) => s.id === profile.id) + 1;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const weeklyDsa = profile.dsaProblems.filter(
      (p) => p.solvedAt && new Date(p.solvedAt) >= weekAgo
    ).length;
    
    const monthlyDsa = profile.dsaProblems.filter(
      (p) => p.solvedAt && new Date(p.solvedAt) >= monthAgo
    ).length;

    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      profile: {
        name: profile.name || "Student",
        xp: profile.xp ?? 0,
        coins: profile.coins ?? 0,
        level: profile.level ?? 1,
        codingStreak: profile.codingStreak ?? 0,
        department: profile.department || "N/A",
        college: profile.college || "N/A"
      },
      scores,
      suggestions,
      rank: rank > 0 ? rank : 1,
      totalStudents: allStudents.length > 0 ? allStudents.length : 1,
      weeklyDsa,
      monthlyDsa,
      notifications: notifications || [],
      stats: {
        totalDsa: profile.dsaProblems.length,
        totalProjects: profile.projects.length,
        totalCerts: profile.certifications.length,
        totalInterviews: profile.mockInterviews.length,
      },
    });
  } catch (error: any) {
    console.error("GET /api/student/dashboard error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data", details: error.message }, { status: 500 });
  }
}
