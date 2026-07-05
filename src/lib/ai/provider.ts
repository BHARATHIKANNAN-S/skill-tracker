/**
 * Unified AI provider — supports Groq, OpenRouter, Google Gemini, and rule-based fallback.
 */

export type AiMessage = { role: "system" | "user" | "assistant"; content: string };

function getApiKey(): string | undefined {
  return (
    process.env.GROQ_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.XAI_API_KEY
  );
}

function isGroqKey(key: string) {
  return key.startsWith("gsk_");
}

function isOpenRouterKey(key: string) {
  return key.startsWith("sk-or-");
}

function isGeminiKey(key: string) {
  return key.startsWith("AIza");
}

async function callGroq(messages: AiMessage[], model?: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("No Groq API key configured");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || process.env.AI_MODEL || "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "No response generated.";
}

async function callOpenRouter(messages: AiMessage[], model?: string): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY || getApiKey();
  if (!key) throw new Error("No API key configured");

  const defaultModel = isOpenRouterKey(key)
    ? "gpt-4o-mini"
    : process.env.AI_MODEL || "google/gemini-2.0-flash-exp:free";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "SkillForge",
    },
    body: JSON.stringify({
      model: model || process.env.AI_MODEL || defaultModel,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "No response generated.";
}

async function callGemini(prompt: string, system?: string): Promise<string> {
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("No API key configured");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: process.env.AI_MODEL || "gemini-1.5-flash",
    systemInstruction: system,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateAiText(
  messages: AiMessage[],
  options?: { model?: string }
): Promise<string> {
  const key = getApiKey();
  if (!key) {
    throw new Error("AI API key not configured. Add GROQ_API_KEY to .env");
  }

  if (isGroqKey(key)) {
    return callGroq(messages, options?.model);
  }

  if (isOpenRouterKey(key)) {
    return callOpenRouter(messages, options?.model);
  }

  if (isGeminiKey(key)) {
    const system = messages.find((m) => m.role === "system")?.content;
    const userMsgs = messages.filter((m) => m.role !== "system");
    const prompt = userMsgs.map((m) => `${m.role}: ${m.content}`).join("\n");
    return callGemini(prompt, system);
  }

  try {
    return await callGroq(messages, options?.model);
  } catch {
    try {
      return await callOpenRouter(messages, options?.model);
    } catch {
      const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
      return callGemini(prompt);
    }
  }
}

export async function askAiAssistant(message: string, context?: string): Promise<string> {
  const systemPrompt = `You are SkillForge AI Mentor — a friendly, expert career coach for college students preparing for placements in India.
Help with: resume tips, DSA practice, aptitude, mock interviews, project ideas, skill roadmaps, and placement readiness.
Be concise, actionable, and encouraging. Use bullet points when listing steps.
${context ? `\nStudent context:\n${context}` : ""}`;

  return generateAiText([
    { role: "system", content: systemPrompt },
    { role: "user", content: message },
  ]);
}

export async function generateStructuredAi(
  prompt: string,
  system: string
): Promise<string> {
  return generateAiText([
    { role: "system", content: system },
    { role: "user", content: prompt },
  ]);
}

export function isAiConfigured(): boolean {
  return !!getApiKey();
}
