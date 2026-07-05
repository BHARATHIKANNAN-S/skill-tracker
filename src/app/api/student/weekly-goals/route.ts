import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getProfileId(userId: string) {
  const profile = await prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } });
  return profile?.id;
}

const goalSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  target: z.number().int().min(1).default(1),
  progress: z.number().int().min(0).default(0),
  dueDate: z.string(),
  completed: z.boolean().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const goals = await prisma.weeklyGoal.findMany({
    where: { studentId },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
  });

  return NextResponse.json({ goals });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  try {
    const body = await request.json();
    const data = goalSchema.parse(body);

    const goal = await prisma.weeklyGoal.create({
      data: {
        studentId,
        title: data.title,
        description: data.description || null,
        target: data.target,
        progress: data.progress,
        dueDate: new Date(data.dueDate),
        completed: data.completed || false,
      },
    });

    return NextResponse.json({ goal });
  } catch {
    return NextResponse.json({ error: "Failed to save weekly goal" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Goal ID required" }, { status: 400 });

    const body = await request.json();
    const updates = {
      progress: body.progress,
      completed: body.completed,
    };

    const goal = await prisma.weeklyGoal.update({
      where: { id, studentId },
      data: updates,
    });

    return NextResponse.json({ goal });
  } catch {
    return NextResponse.json({ error: "Failed to update weekly goal" }, { status: 400 });
  }
}
