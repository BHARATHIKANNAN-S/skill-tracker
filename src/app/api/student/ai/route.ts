import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  generateAiSuggestionsSmart,
  generateInterviewQuestionsSmart,
  generateWeeklyStudyPlanSmart,
  explainWeakAreas,
} from "@/lib/ai/mentor";
import { calculatePlacementReadiness } from "@/lib/scoring";
import { isAiConfigured } from "@/lib/ai";

async function getStudentData(userId: string) {
  return prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: true, projects: true, certifications: true,
      dsaProblems: true, aptitudeTests: true,
      mockInterviews: true, resumes: true,
    },
  });
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "suggestions";
  const type = searchParams.get("type") || "technical";
  const skill = searchParams.get("skill") || undefined;

  const data = await getStudentData(session.userId);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const aiEnabled = isAiConfigured();

  switch (action) {
    case "suggestions":
      return NextResponse.json({ suggestions: await generateAiSuggestionsSmart(data), aiEnabled });
    case "questions":
      return NextResponse.json({ questions: await generateInterviewQuestionsSmart(type, data, skill), aiEnabled });
    case "study-plan":
      return NextResponse.json({ plan: await generateWeeklyStudyPlanSmart(data), aiEnabled });
    case "weak-areas":
      return NextResponse.json({ areas: explainWeakAreas(data), aiEnabled });
    case "placement":
      return NextResponse.json({ prediction: calculatePlacementReadiness(data), aiEnabled });
    case "status":
      return NextResponse.json({ aiEnabled, provider: aiEnabled ? "connected" : "offline" });
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getStudentData(session.userId);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const suggestions = await generateAiSuggestionsSmart(data);
  for (const s of suggestions) {
    await prisma.aiSuggestion.create({
      data: { studentId: data.id, type: s.type, title: s.title, content: s.content, priority: s.priority },
    });
  }

  return NextResponse.json({ message: "Suggestions generated", count: suggestions.length, aiEnabled: isAiConfigured() });
}
