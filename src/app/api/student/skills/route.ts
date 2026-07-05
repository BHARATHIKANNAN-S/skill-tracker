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
  const skills = await prisma.skill.findMany({ where: { studentId }, orderBy: { lastUpdated: "desc" } });
  return NextResponse.json({ skills });
}

const skillSchema = z.object({
  name: z.string(),
  level: z.string().default("Beginner"),
  experience: z.string().optional(),
  confidence: z.number().min(0).max(100).default(0),
  learningStatus: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "EXPERT"]).default("NOT_STARTED"),
  certificate: z.string().optional(),
  projectRelated: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const data = skillSchema.parse(body);
    const skill = await prisma.skill.upsert({
      where: { studentId_name: { studentId, name: data.name } },
      create: { ...data, studentId },
      update: { ...data, lastUpdated: new Date() },
    });
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { xp: { increment: 10 } },
    });
    return NextResponse.json({ skill });
  } catch {
    return NextResponse.json({ error: "Failed to save skill" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.skill.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
