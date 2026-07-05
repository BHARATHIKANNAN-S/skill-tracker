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
  const certifications = await prisma.certification.findMany({ where: { studentId }, orderBy: { issueDate: "desc" } });
  return NextResponse.json({ certifications });
}

const certSchema = z.object({
  name: z.string(),
  organization: z.string(),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  certificateId: z.string().optional(),
  verificationUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  skillCategory: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const studentId = await getProfileId(session.userId);
  if (!studentId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await request.json();
    const data = certSchema.parse(body);
    const certification = await prisma.certification.create({
      data: {
        ...data,
        studentId,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { xp: { increment: 20 }, coins: { increment: 5 } },
    });
    return NextResponse.json({ certification });
  } catch {
    return NextResponse.json({ error: "Failed to add certification" }, { status: 400 });
  }
}
