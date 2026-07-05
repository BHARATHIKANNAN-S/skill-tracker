import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askAiAssistant, isAiConfigured } from "@/lib/ai";
import { calculatePlacementReadiness } from "@/lib/scoring";

async function getStudentContext(userId: string): Promise<string> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      skills: true,
      projects: true,
      dsaProblems: true,
      mockInterviews: true,
      resumes: { where: { isActive: true }, take: 1 },
    },
  });
  if (!profile) return "";

  const scores = calculatePlacementReadiness({
    ...profile,
    certifications: [],
    aptitudeTests: [],
  });

  return [
    `Name: ${profile.name}`,
    `College: ${profile.college || "N/A"}`,
    `Target Role: ${profile.preferredRole || "Software Developer"}`,
    `Skills: ${profile.skills.map((s) => `${s.name}(${s.confidence}%)`).join(", ") || "None"}`,
    `Projects: ${profile.projects.length}`,
    `DSA Solved: ${profile.dsaProblems.length}`,
    `Coding Streak: ${profile.codingStreak} days`,
    `Placement Readiness: ${scores.overall}% (${scores.status})`,
    `Weak areas: ${scores.explanation.slice(0, 2).join("; ")}`,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const body = await request.json();
    const message = String(body.message || "").trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!isAiConfigured()) {
      return NextResponse.json({
        error: "AI not configured. Add GROQ_API_KEY to your .env file.",
      }, { status: 503 });
    }

    const context = await getStudentContext(session.userId);
    const reply = await askAiAssistant(message, context);
    return NextResponse.json({ reply, poweredBy: "ai" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unable to generate response";
    console.error("[AI Chat Error]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
