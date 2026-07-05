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
  const interviews = await prisma.mockInterview.findMany({
    where: { studentId }, orderBy: { conductedAt: "desc" },
  });
  return NextResponse.json({ interviews });
}

const interviewSchema = z.object({
  type: z.string().default("Technical"),
  technicalScore: z.number().min(0).max(100),
  hrScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  problemSolvingScore: z.number().min(0).max(100),
  feedback: z.string().optional(),
  suggestions: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const data = interviewSchema.parse(body);
    const overallScore = Math.round(
      (data.technicalScore + data.hrScore + data.communicationScore +
       data.confidenceScore + data.problemSolvingScore) / 5
    );
    const interview = await prisma.mockInterview.create({
      data: { ...data, studentId, overallScore },
    });
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { xp: { increment: 30 }, coins: { increment: 10 } },
    });
    return NextResponse.json({ interview });
  } catch {
    return NextResponse.json({ error: "Failed to save interview" }, { status: 400 });
  }
}
