import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { analyzeResume } from "@/lib/scoring";

async function getProfileId(userId: string) {
  const p = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true, skills: { select: { name: true } } },
  });
  return p;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const profile = await getProfileId(session.userId);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  
  try {
    const resumes = await prisma.resume.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ resumes: resumes || [] });
  } catch (error: any) {
    console.error("Failed to fetch resumes:", error);
    return NextResponse.json({ error: "Failed to fetch resumes", details: error.message }, { status: 500 });
  }
}

const resumeSchema = z.object({
  fileName: z.string(),
  fileUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const profile = await getProfileId(session.userId);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  try {
    const body = await request.json();
    const data = resumeSchema.parse(body);
    const skillNames = profile.skills.map((s) => s.name);
    
    // Perform ATS/Resume Analysis
    const analysis = analyzeResume(data.fileName, skillNames);

    const count = await prisma.resume.count({
      where: { studentId: profile.id }
    });
    
    // Set all previous resumes as inactive
    await prisma.resume.updateMany({
      where: { studentId: profile.id },
      data: { isActive: false },
    });

    // Create the new active resume using explicit mapping
    const resume = await prisma.resume.create({
      data: {
        studentId: profile.id,
        fileName: data.fileName,
        fileUrl: data.fileUrl || null,
        version: count + 1,
        atsScore: analysis.atsScore,
        grammarScore: analysis.grammarScore,
        formattingScore: analysis.formattingScore,
        keywordScore: analysis.keywordScore,
        industryReady: analysis.industryReady,
        missingSkills: JSON.stringify(analysis.missingSkills || []),
        suggestions: JSON.stringify(analysis.suggestions || []),
        isActive: true,
      },
    });
    
    return NextResponse.json({ resume, analysis });
  } catch (error: any) {
    console.error("Failed to analyze and save resume:", error);
    return NextResponse.json({ error: "Failed to analyze resume", details: error.message }, { status: 400 });
  }
}
