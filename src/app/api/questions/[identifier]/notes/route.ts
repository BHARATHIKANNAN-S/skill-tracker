import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function getStudentId(userId: string) {
  const p = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  return p?.id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const resolvedParams = await params;
  const identifier = resolvedParams.identifier;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const studentId = await getStudentId(session.userId);
  if (!studentId) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

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

    const note = await prisma.dsaQuestionNote.findUnique({
      where: {
        studentId_questionId: {
          studentId,
          questionId: question.id
        }
      }
    });

    return NextResponse.json({ note: note?.content || "" });
  } catch (error: any) {
    console.error(`GET /api/questions/${identifier}/notes error:`, error);
    return NextResponse.json({ error: "Failed to fetch notes", details: error.message }, { status: 500 });
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

  const studentId = await getStudentId(session.userId);
  if (!studentId) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { content } = body;

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

    const note = await prisma.dsaQuestionNote.upsert({
      where: {
        studentId_questionId: {
          studentId,
          questionId: question.id
        }
      },
      update: {
        content: content || ""
      },
      create: {
        studentId,
        questionId: question.id,
        content: content || ""
      }
    });

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    console.error(`POST /api/questions/${identifier}/notes error:`, error);
    return NextResponse.json({ error: "Failed to save notes", details: error.message }, { status: 500 });
  }
}
