import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.studentProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ profile });
}

const updateSchema = z.object({
  name: z.string().optional(),
  photo: z.string().optional(),
  department: z.string().optional(),
  college: z.string().optional(),
  year: z.number().optional(),
  registerNumber: z.string().optional(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  preferredRole: z.string().optional(),
  careerGoal: z.string().optional(),
  languagesKnown: z.string().optional(),
  bio: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);
    const profile = await prisma.studentProfile.update({
      where: { userId: session.userId },
      data,
    });
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}
