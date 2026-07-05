import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateProjectQuality } from "@/lib/scoring";

async function getProfileId(userId: string) {
  const p = await prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } });
  return p?.id;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const projects = await prisma.project.findMany({ where: { studentId }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ projects });
}

const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.string(),
  duration: z.string().optional(),
  teamSize: z.number().optional(),
  role: z.string().optional(),
  githubUrl: z.string().optional(),
  liveDemo: z.string().optional(),
  screenshots: z.string().optional(),
  documents: z.string().optional(),
  status: z.enum(["PLANNED", "IN_PROGRESS", "COMPLETED", "DEPLOYED"]).default("IN_PROGRESS"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]).default("MEDIUM"),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const data = projectSchema.parse(body);
    const qualityScore = calculateProjectQuality(data);
    const project = await prisma.project.create({
      data: { ...data, studentId, qualityScore },
    });
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { xp: { increment: 25 }, coins: { increment: 5 } },
    });
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
