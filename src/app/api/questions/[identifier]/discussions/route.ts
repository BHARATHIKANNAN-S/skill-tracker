import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getStudentProfile(userId: string) {
  return prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true, name: true, photo: true }
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const resolvedParams = await params;
  const identifier = resolvedParams.identifier;

  try {
    const question = await prisma.dsaQuestion.findFirst({
      where: {
        OR: [
          { slug: identifier },
          { id: identifier }
        ]
      },
      select: { id: true }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const discussions = await prisma.dsaDiscussion.findMany({
      where: { questionId: question.id },
      orderBy: { createdAt: "asc" } // Chronological order
    });

    return NextResponse.json(discussions);
  } catch (error: any) {
    console.error(`GET /api/questions/${identifier}/discussions error:`, error);
    return NextResponse.json({ error: "Failed to fetch discussions", details: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const resolvedParams = await params;
  const identifier = resolvedParams.identifier;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getStudentProfile(session.userId);
  if (!profile) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Discussion content cannot be empty" }, { status: 400 });
    }

    const question = await prisma.dsaQuestion.findFirst({
      where: {
        OR: [
          { slug: identifier },
          { id: identifier }
        ]
      },
      select: { id: true }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const newDiscussion = await prisma.dsaDiscussion.create({
      data: {
        questionId: question.id,
        studentId: profile.id,
        studentName: profile.name,
        studentPhoto: profile.photo || null,
        content: content.trim(),
        parentId: parentId || null
      }
    });

    return NextResponse.json({ success: true, discussion: newDiscussion });
  } catch (error: any) {
    console.error(`POST /api/questions/${identifier}/discussions error:`, error);
    return NextResponse.json({ error: "Failed to create discussion", details: error.message }, { status: 500 });
  }
}
