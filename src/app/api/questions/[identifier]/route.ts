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
  const studentId = session ? await getStudentId(session.userId) : null;

  try {
    // Find by slug first, then by ID
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    let question = await prisma.dsaQuestion.findFirst({
      where: isObjectId
        ? {
            OR: [
              { slug: identifier },
              { id: identifier }
            ]
          }
        : {
            slug: identifier
          }
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    let isBookmarked = false;
    let status = "NOT_STARTED";

    if (studentId) {
      // 1. Record viewed activity in history
      await prisma.dsaRecentActivity.upsert({
        where: {
          studentId_questionId_activityType: {
            studentId,
            questionId: question.id,
            activityType: "VIEWED"
          }
        },
        create: {
          studentId,
          questionId: question.id,
          activityType: "VIEWED"
        },
        update: {
          lastActive: new Date()
        }
      });

      // 2. Check if bookmarked
      const bookmark = await prisma.dsaBookmark.findUnique({
        where: {
          studentId_questionId: {
            studentId,
            questionId: question.id
          }
        }
      });
      isBookmarked = !!bookmark;

      // 3. Check if solved
      const solved = await prisma.dsaSubmission.findFirst({
        where: {
          studentId,
          questionId: question.id,
          status: "SOLVED"
        }
      });

      if (solved) {
        status = "SOLVED";
      } else {
        status = "IN_PROGRESS";
      }
    }

    return NextResponse.json({
      ...question,
      status,
      isBookmarked,
      examples: JSON.parse(question.examples || "[]"),
      hints: JSON.parse(question.hints || "[]"),
      tags: JSON.parse(question.tags || "[]"),
      companies: JSON.parse(question.companies || "[]"),
      similarQuestions: JSON.parse(question.similarQuestions || "[]")
    });
  } catch (error: any) {
    console.error(`GET /api/questions/${identifier} error:`, error);
    return NextResponse.json({ error: "Failed to retrieve question", details: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.identifier;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isObjectId) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    
    // Check if question exists
    const existing = await prisma.dsaQuestion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const updated = await prisma.dsaQuestion.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        difficulty: body.difficulty,
        topic: body.topic,
        description: body.description,
        constraints: body.constraints,
        examples: typeof body.examples === "string" ? body.examples : JSON.stringify(body.examples || []),
        inputFormat: body.inputFormat,
        outputFormat: body.outputFormat,
        hints: typeof body.hints === "string" ? body.hints : JSON.stringify(body.hints || []),
        tags: typeof body.tags === "string" ? body.tags : JSON.stringify(body.tags || []),
        companies: typeof body.companies === "string" ? body.companies : JSON.stringify(body.companies || []),
        acceptanceRate: body.acceptanceRate ? Number(body.acceptanceRate) : undefined,
        estimatedTime: body.estimatedTime ? Number(body.estimatedTime) : undefined,
        leetcodeId: body.leetcodeId ? Number(body.leetcodeId) : undefined,
        leetcodeUrl: body.leetcodeUrl,
        isPremium: body.isPremium !== undefined ? Boolean(body.isPremium) : undefined,
        frequency: body.frequency ? Number(body.frequency) : undefined,
        javaSolution: body.javaSolution,
        cppSolution: body.cppSolution,
        pythonSolution: body.pythonSolution,
        javascriptSolution: body.javascriptSolution,
        timeComplexity: body.timeComplexity,
        spaceComplexity: body.spaceComplexity,
        similarQuestions: typeof body.similarQuestions === "string" ? body.similarQuestions : JSON.stringify(body.similarQuestions || [])
      }
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (error: any) {
    console.error(`PUT /api/questions/${id} error:`, error);
    return NextResponse.json({ error: "Failed to update question", details: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.identifier;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isObjectId) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const existing = await prisma.dsaQuestion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    await prisma.dsaQuestion.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Question deleted successfully" });
  } catch (error: any) {
    console.error(`DELETE /api/questions/${id} error:`, error);
    return NextResponse.json({ error: "Failed to delete question", details: error.message }, { status: 400 });
  }
}
