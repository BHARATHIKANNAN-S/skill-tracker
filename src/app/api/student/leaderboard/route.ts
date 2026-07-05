import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculatePlacementReadiness } from "@/lib/scoring";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = "overall";

  const students = await prisma.studentProfile.findMany({
    include: {
      skills: true, projects: true, certifications: true,
      dsaProblems: true, aptitudeTests: true,
      mockInterviews: true, resumes: true,
      user: { select: { email: true } },
    },
    orderBy: { xp: "desc" },
    take: 50,
  });

  const leaderboard = students.map((s, index) => {
    const scores = calculatePlacementReadiness(s);
    return {
      rank: index + 1,
      id: s.id,
      name: s.name,
      college: s.college,
      department: s.department,
      xp: s.xp,
      level: s.level,
      codingStreak: s.codingStreak,
      photo: s.photo,
      overallScore: scores.overall,
      codingScore: scores.coding,
      projectScore: scores.projects,
      resumeScore: scores.resume,
      dsaCount: s.dsaProblems.length,
      projectCount: s.projects.length,
    };
  });

  leaderboard.sort((a, b) => b.overallScore - a.overallScore);
  leaderboard.forEach((entry, i) => { entry.rank = i + 1; });

  return NextResponse.json({ leaderboard, type });
}
