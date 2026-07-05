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
    const { code, language, title, description } = body;

    if (!code || !language || !title) {
      return NextResponse.json({ error: "Code, language, and problem title are required" }, { status: 400 });
    }

    const systemPrompt = `You are a senior full-stack engineer and tech lead.
Review the user's code for a DSA problem. Evaluate correctness, mistakes, style, naming, complexities, and edge cases.
You MUST respond ONLY with a valid JSON object in the following format (no markdown blocks, no prefix text):
{
  "correctness": "Brief assessment of code correctness.",
  "mistakes": "List of bugs, logic errors, or syntax issues, or 'None' if correct.",
  "optimization": "Suggestions to improve efficiency (Time/Space) or 'Already optimal'.",
  "betterVariableNames": "Recommended names for variables/functions to improve readability, or 'Good naming'.",
  "timeComplexity": "Worst-case time complexity of this code (e.g. O(N)).",
  "spaceComplexity": "Auxiliary space complexity of this code (e.g. O(1)).",
  "codingStyle": "Style critique (indentation, structure, conventions).",
  "edgeCases": "How well the code handles edge cases (empty input, null pointers, limits).",
  "finalRating": 85 // Integer score from 0 to 100 based on overall quality
}`;

    const userPrompt = `Problem: ${title}
Description:
${description || "N/A"}

Language: ${language}
User Code:
\`\`\`${language}
${code}
\`\`\`

Perform a comprehensive code review and return the structured JSON response.`;

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
      console.error("Failed to parse Gemini review output:", aiResultStr);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("POST /api/ai/review error:", error);
    return NextResponse.json({ error: "Failed to review code", details: error.message }, { status: 500 });
  }
}
