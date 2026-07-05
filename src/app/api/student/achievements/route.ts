import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.userId },
    include: {
      achievements: { include: { achievement: true } },
      _count: { select: { achievements: true } },
    },
  });

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const achievements = profile.achievements.map((a) => ({
    id: a.id,
    name: a.achievement.name,
    earnedAt: a.earnedAt,
  }));

  const totalXp = profile.xp;
  const totalCoins = profile.coins;
  const achievementCount = profile._count.achievements;
  const badgeCount = profile._count.achievements; // Simplified — in real app, separate badges table

  return NextResponse.json({
    achievements,
    stats: { totalXp, totalCoins, achievementCount, badgeCount },
  });
}
