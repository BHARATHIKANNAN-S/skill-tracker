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
    // Find the question by slug or ID
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const question = await prisma.dsaQuestion.findFirst({
      where: isObjectId
        ? {
            OR: [
              { slug: identifier },
              { id: identifier }
            ]
          }
        : {
            slug: identifier
          },
      select: { id: true }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Toggle bookmark
    const existingBookmark = await prisma.dsaBookmark.findUnique({
      where: {
        studentId_questionId: {
          studentId,
          questionId: question.id
        }
      }
    });

    if (existingBookmark) {
      await prisma.dsaBookmark.delete({
        where: {
          id: existingBookmark.id
        }
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      await prisma.dsaBookmark.create({
        data: {
          studentId,
          questionId: question.id
        }
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error: any) {
    console.error(`POST /api/questions/${identifier}/bookmark error:`, error);
    return NextResponse.json({ error: "Failed to toggle bookmark", details: error.message }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const resolvedParams = await params;
  const identifier = resolvedParams.identifier;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ bookmarked: false });
  }

  const studentId = await getStudentId(session.userId);
  if (!studentId) {
    return NextResponse.json({ bookmarked: false });
  }

  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const question = await prisma.dsaQuestion.findFirst({
      where: isObjectId
        ? {
            OR: [
              { slug: identifier },
              { id: identifier }
            ]
          }
        : {
            slug: identifier
          },
      select: { id: true }
    });

    if (!question) {
      return NextResponse.json({ bookmarked: false });
    }

    const bookmark = await prisma.dsaBookmark.findUnique({
      where: {
        studentId_questionId: {
          studentId,
          questionId: question.id
        }
      }
    });

    return NextResponse.json({ bookmarked: !!bookmark });
  } catch (error) {
    return NextResponse.json({ bookmarked: false });
  }
}
