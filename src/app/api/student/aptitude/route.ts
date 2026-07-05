import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getProfileId(userId: string) {
  const p = await prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } });
  return p?.id;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tests = await prisma.aptitudeTest.findMany({
    where: { studentId }, orderBy: { takenAt: "desc" },
  });

  const categories = [...new Set(tests.map((t) => t.category))];
  const weakAreas = categories.map((cat) => {
    const catTests = tests.filter((t) => t.category === cat);
    const avg = catTests.reduce((s, t) => s + (t.correctAnswers / t.totalQuestions) * 100, 0) / catTests.length;
    return { category: cat, avgScore: Math.round(avg), count: catTests.length };
  }).sort((a, b) => a.avgScore - b.avgScore);

  const avgScore = tests.length > 0
    ? Math.round(tests.reduce((s, t) => s + t.score, 0) / tests.length)
    : 0;
  const avgTime = tests.length > 0
    ? Math.round(tests.reduce((s, t) => s + t.timeTaken, 0) / tests.length)
    : 0;

  return NextResponse.json({ tests, stats: { avgScore, avgTime, weakAreas, total: tests.length } });
}

const aptSchema = z.object({
  category: z.string(),
  score: z.number(),
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  timeTaken: z.number(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const data = aptSchema.parse(body);
    const test = await prisma.aptitudeTest.create({ data: { ...data, studentId } });
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { xp: { increment: 10 } },
    });
    return NextResponse.json({ test });
  } catch {
    return NextResponse.json({ error: "Failed to save test" }, { status: 400 });
  }
}
