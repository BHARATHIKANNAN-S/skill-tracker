import { NextRequest, NextResponse } from "next/server";
import { generateAiText } from "@/lib/ai/provider";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const systemPrompt = `You are a helpful programming tutor.
Generate 4 sequential hints for the given problem.
IMPORTANT: You MUST NOT reveal the actual code solution or complete algorithm details. Provide conceptual, helpful guidance to nudge the student in the right direction.
Return ONLY a valid JSON object in this format (no prefix text, no markdown block):
{
  "hints": [
    "Hint 1: First conceptual pointer or entry-level advice.",
    "Hint 2: Second intermediate pointer focusing on data structures or math.",
    "Hint 3: Third advanced hint pushing towards optimal complexity.",
    "Final Hint: The final conceptual advice or structure suggestion to tie things together without giving away code."
  ]
}`;

    const userPrompt = `Problem: ${title}
Description:
${description}

Generate the 4 hints in the specified JSON structure.`;

    const aiResultStr = await generateAiText([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    let parsedResult;
    try {
      const match = aiResultStr.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : aiResultStr;
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse Gemini hint output:", aiResultStr);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("POST /api/ai/hint error:", error);
    return NextResponse.json({ error: "Failed to generate hints", details: error.message }, { status: 500 });
  }
}
