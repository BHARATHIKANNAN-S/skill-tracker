import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateAiText } from "@/lib/ai/provider";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, language, code, topic, difficulty } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required for analysis." }, { status: 400 });
    }

    const systemPrompt = `You are a Senior Technical Interviewer and Code Quality Analyzer. 
Your task is to analyze the student's solved Data Structures and Algorithms (DSA) code submission and return a structured JSON response.

Instructions:
1. Provide a comprehensive, accurate analysis.
2. The response must be a valid JSON object matching the schema below. 
3. DO NOT return any markdown wrapping (no \`\`\`json blocks), just the raw JSON text.
4. Suggestions must be constructive and detailed. Generate 1 to 4 actionable suggestions.

JSON Output Schema:
{
  "score": 85, // Overall score out of 100 as integer
  "timeComplexity": "O(N)", // String time complexity
  "spaceComplexity": "O(1)", // String space complexity
  "optimal": true, // Boolean: is this the most optimal approach?
  "codeQuality": "Excellent structure and formatting", // String: assessment of general code quality
  "readability": "High readability, clean syntax", // String: readability assessment
  "naming": "Very good, follows camelCase standard", // String: variable naming convention check
  "memoryUsage": "Low heap allocation, clean memory lifecycle", // String: memory utilization analysis
  "readiness": "Strong candidate. Displays excellent mastery.", // String: interview readiness score / statement
  "edgeCases": "Handles empty arrays, large bounds. Watch out for integer overflow on large sums.", // String: edge cases check
  "suggestions": [ // Array of suggestion cards
    {
      "title": "Use Two Pointer", // Title of the suggestion (e.g. "Use HashMap", "Reduce nested loops")
      "explanation": "Explain why this change is needed and how to implement it. Provide a brief concept."
    }
  ]
}`;

    const userPrompt = `Problem Title: ${title || "DSA Problem"}
Topic: ${topic || "Unknown"}
Difficulty: ${difficulty || "Medium"}
Language: ${language || "Java"}

Code Submission:
${code}`;

    const rawResponse = await generateAiText([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Cleanup response in case LLM wraps it in markdown backticks
    let cleanResponse = rawResponse.trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse.substring(7);
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.substring(3);
    }
    if (cleanResponse.endsWith("```")) {
      cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
    }
    cleanResponse = cleanResponse.trim();

    try {
      const parsedData = JSON.parse(cleanResponse);
      return NextResponse.json(parsedData);
    } catch {
      console.error("JSON Parsing Error on raw AI response:", rawResponse);
      
      // Fallback response if JSON parsing fails
      return NextResponse.json({
        score: 75,
        timeComplexity: "O(N^2)",
        spaceComplexity: "O(1)",
        optimal: false,
        codeQuality: "Fair. Contains potential optimizations.",
        readability: "Good formatting",
        naming: "Acceptable variable names",
        memoryUsage: "Standard memory profile",
        readiness: "Progressing. Needs structural optimization.",
        edgeCases: "Make sure to validate boundary constraints.",
        suggestions: [
          {
            title: "Optimize Complexity",
            explanation: "Review data structures such as HashMaps or two-pointer techniques to improve execution time."
          }
        ]
      });
    }
  } catch (error) {
    console.error("AI Analysis API Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to AI Analysis service. " + (error as Error).message },
      { status: 550 }
    );
  }
}
