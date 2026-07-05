import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const platform = searchParams.get("platform") || "";
  const search = searchParams.get("search") || "";
  const limit = Number(searchParams.get("limit") || 40);

  const where: Record<string, unknown> = {};
  if (topic) where.topic = topic;
  if (difficulty) where.difficulty = difficulty;
  if (platform) where.platform = platform;
  if (search) where.OR = [
    { title: { contains: search } },
    { topic: { contains: search } },
    { description: { contains: search } },
  ];

  const problems = await prisma.dsaQuestion.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ problems });
}
