import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const SLUG_TO_TOPIC_NAME: Record<string, string> = {
  "arrays": "Arrays",
  "strings": "Strings",
  "hashmap": "HashMap",
  "stack": "Stack",
  "queue": "Queue",
  "linked-list": "Linked List",
  "binary-tree": "Binary Tree",
  "bst": "BST",
  "heap": "Heap",
  "binary-search": "Binary Search",
  "sliding-window": "Sliding Window",
  "two-pointers": "Two Pointers",
  "prefix-sum": "Prefix Sum",
  "greedy": "Greedy",
  "recursion": "Recursion",
  "backtracking": "Backtracking",
  "graph": "Graph",
  "trie": "Trie",
  "dynamic-programming": "Dynamic Programming",
  "bit-manipulation": "Bit Manipulation",
  "union-find": "Union Find",
  "segment-tree": "Segment Tree",
  "math": "Math",
  "sorting": "Sorting",
  "searching": "Searching"
};

async function getStudentId(userId: string) {
  const p = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  return p?.id;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topic: string }> }
) {
  const resolvedParams = await params;
  const topicSlug = resolvedParams.topic.toLowerCase();
  const dbTopicName = SLUG_TO_TOPIC_NAME[topicSlug] || resolvedParams.topic;

  const session = await getSession();
  const studentId = session ? await getStudentId(session.userId) : null;

  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get("difficulty") || "";
  const status = searchParams.get("status") || "";

  const where: any = {
    topic: dbTopicName
  };

  if (difficulty && difficulty.toUpperCase() !== "ALL") {
    where.difficulty = difficulty.toUpperCase();
  }

  try {
    const questions = await prisma.dsaQuestion.findMany({
      where,
      orderBy: { leetcodeId: "asc" }
    });

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

      return NextResponse.json({
        topic: dbTopicName,
        questions: result
      });
    }

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

    return NextResponse.json({
      topic: dbTopicName,
      questions: result
    });
  } catch (error: any) {
    console.error(`GET /api/questions/topic/${resolvedParams.topic} error:`, error);
    return NextResponse.json({ error: "Failed to fetch topic questions", details: error.message }, { status: 500 });
  }
}
