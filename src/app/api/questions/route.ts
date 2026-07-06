import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { syncQuestionsInDatabase } from "@/lib/questions-data";

async function getStudentId(userId: string) {
  const p = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  return p?.id;
}

export async function GET(request: NextRequest) {
  await syncQuestionsInDatabase();
  const session = await getSession();
  const studentId = session ? await getStudentId(session.userId) : null;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const topic = searchParams.get("topic") || "";
  const status = searchParams.get("status") || "";
  const company = searchParams.get("company") || "";
  const platform = searchParams.get("platform") || "LeetCode"; // Default to LeetCode as per instructions

  const where: any = {};

  if (topic) {
    where.topic = { equals: topic };
  }

  if (difficulty && difficulty.toUpperCase() !== "ALL") {
    where.difficulty = { equals: difficulty.toUpperCase() };
  }

  // Text search on title, leetcodeId, description or tags
  if (search) {
    const isNum = !isNaN(Number(search));
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { tags: { contains: search } },
    ];
    if (isNum) {
      where.OR.push({ leetcodeId: { equals: Number(search) } });
    }
  }

  if (company) {
    where.companies = { contains: company };
  }

  try {
    const questions = await prisma.dsaQuestion.findMany({
      where,
      orderBy: { leetcodeId: "asc" }
    });

    // If user is logged in, attach bookmarks and status details
    if (studentId) {
      const userBookmarks = await prisma.dsaBookmark.findMany({
        where: { studentId },
        select: { questionId: true }
      });
      const solvedSubmissions = await prisma.dsaSubmission.findMany({
        where: { studentId, status: "SOLVED" },
        select: { questionId: true }
      });
      const viewedActivities = await prisma.dsaRecentActivity.findMany({
        where: { studentId, activityType: "VIEWED" },
        select: { questionId: true }
      });

      const bookmarkSet = new Set(userBookmarks.map(b => b.questionId));
      const solvedSet = new Set(solvedSubmissions.map(s => s.questionId));
      const viewedSet = new Set(viewedActivities.map(v => v.questionId));

      let result = questions.map(q => {
        let qStatus = "NOT_STARTED";
        if (solvedSet.has(q.id)) {
          qStatus = "SOLVED";
        } else if (viewedSet.has(q.id)) {
          qStatus = "IN_PROGRESS";
        }

        return {
          ...q,
          status: qStatus,
          isBookmarked: bookmarkSet.has(q.id),
          examples: JSON.parse(q.examples || "[]"),
          hints: JSON.parse(q.hints || "[]"),
          tags: JSON.parse(q.tags || "[]"),
          companies: JSON.parse(q.companies || "[]"),
          similarQuestions: JSON.parse(q.similarQuestions || "[]")
        };
      });

      // Filter by status if requested
      if (status) {
        if (status.toUpperCase() === "SOLVED") {
          result = result.filter(r => r.status === "SOLVED");
        } else if (status.toUpperCase() === "UNSOLVED") {
          result = result.filter(r => r.status !== "SOLVED");
        }
      }

      return NextResponse.json(result);
    }

    // Unauthenticated mapping
    const result = questions.map(q => ({
      ...q,
      status: "NOT_STARTED",
      isBookmarked: false,
      examples: JSON.parse(q.examples || "[]"),
      hints: JSON.parse(q.hints || "[]"),
      tags: JSON.parse(q.tags || "[]"),
      companies: JSON.parse(q.companies || "[]"),
      similarQuestions: JSON.parse(q.similarQuestions || "[]")
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/questions error:", error);
    return NextResponse.json({ error: "Failed to fetch questions", details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Admin-like question creation
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      slug,
      difficulty,
      topic,
      description,
      constraints,
      examples,
      inputFormat,
      outputFormat,
      hints,
      tags,
      companies,
      acceptanceRate,
      estimatedTime,
      leetcodeId,
      leetcodeUrl,
      isPremium,
      frequency,
      javaSolution,
      cppSolution,
      pythonSolution,
      javascriptSolution,
      timeComplexity,
      spaceComplexity,
      similarQuestions
    } = body;

    const question = await prisma.dsaQuestion.create({
      data: {
        title,
        slug,
        difficulty: difficulty || "EASY",
        topic,
        description,
        constraints,
        examples: typeof examples === "string" ? examples : JSON.stringify(examples || []),
        inputFormat,
        outputFormat,
        hints: typeof hints === "string" ? hints : JSON.stringify(hints || []),
        tags: typeof tags === "string" ? tags : JSON.stringify(tags || []),
        companies: typeof companies === "string" ? companies : JSON.stringify(companies || []),
        acceptanceRate: Number(acceptanceRate || 50.0),
        estimatedTime: Number(estimatedTime || 15),
        leetcodeId: leetcodeId ? Number(leetcodeId) : null,
        leetcodeUrl,
        isPremium: Boolean(isPremium),
        frequency: frequency ? Number(frequency) : 0.0,
        javaSolution,
        cppSolution,
        pythonSolution,
        javascriptSolution,
        timeComplexity,
        spaceComplexity,
        similarQuestions: typeof similarQuestions === "string" ? similarQuestions : JSON.stringify(similarQuestions || [])
      }
    });

    return NextResponse.json({ success: true, question });
  } catch (error: any) {
    console.error("POST /api/questions error:", error);
    return NextResponse.json({ error: "Failed to create question", details: error.message }, { status: 400 });
  }
}
