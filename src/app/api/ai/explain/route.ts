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
    const { title, description, constraints, examples } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const systemPrompt = `You are an expert technical interviewer and AI algorithm coach.
Generate a structured explanation for the given programming problem.
You MUST respond ONLY with a valid JSON object in the following format (no markdown blocks, no prefix text):
{
  "simpleExplanation": "Simple English explanation of the problem.",
  "whatIsAsking": "Clarification of what exactly the problem is asking for.",
  "bruteForce": {
    "description": "Explanation of the brute force approach.",
    "time": "Time complexity (e.g. O(N^2))",
    "space": "Space complexity (e.g. O(1))"
  },
  "better": {
    "description": "Explanation of a better intermediate approach. If none exists, write 'N/A' and state that we jump to optimal.",
    "time": "Time complexity",
    "space": "Space complexity"
  },
  "optimal": {
    "description": "Explanation of the optimal approach.",
    "time": "Time complexity",
    "space": "Space complexity"
  },
  "whyOptimalWorks": "Intuition and reason why the optimal approach works.",
  "dryRun": "Step-by-step dry run of the optimal approach using one of the examples.",
  "timeComplexity": "Detailed justification of optimal time complexity.",
  "spaceComplexity": "Detailed justification of optimal space complexity.",
  "edgeCases": ["Edge case 1", "Edge case 2", "Edge case 3"],
  "interviewTips": ["Tip 1", "Tip 2"],
  "commonMistakes": ["Mistake 1", "Mistake 2"]
}`;

    const userPrompt = `Problem Title: ${title}
Problem Statement:
${description}

Constraints:
${constraints || "N/A"}

Examples:
${typeof examples === "string" ? examples : JSON.stringify(examples || [])}

Generate the detailed explanation according to the specified JSON schema.`;

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
      console.error("Failed to parse Gemini explanation output:", aiResultStr);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("POST /api/ai/explain error:", error);
    return NextResponse.json({ error: "Failed to generate AI explanation", details: error.message }, { status: 500 });
  }
}
