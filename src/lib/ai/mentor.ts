import type { StudentData } from "../scoring";
import { calculatePlacementReadiness } from "../scoring";
import { generateStructuredAi, isAiConfigured } from "./provider";

const COURSE_DB: Record<string, { title: string; platform: string }[]> = {
  Java: [{ title: "Java Programming Masterclass", platform: "Udemy" }],
  Python: [{ title: "Python for Everybody", platform: "Coursera" }],
  React: [{ title: "React - The Complete Guide", platform: "Udemy" }],
  "Data Structures": [{ title: "DSA in Java", platform: "GeeksforGeeks" }],
};

function buildStudentSummary(data: StudentData): string {
  const scores = calculatePlacementReadiness(data);
  return JSON.stringify({
    name: data.name,
    college: data.college,
    targetRole: data.preferredRole,
    skills: data.skills.map((s) => ({ name: s.name, confidence: s.confidence, status: s.learningStatus })),
    projects: data.projects.length,
    dsaSolved: data.dsaProblems.length,
    certifications: data.certifications.length,
    interviews: data.mockInterviews.length,
    codingStreak: data.codingStreak,
    scores,
  }, null, 2);
}

export function generateAiSuggestions(data: StudentData) {
  const scores = calculatePlacementReadiness(data);
  const suggestions: { type: string; title: string; content: string; priority: string }[] = [];

  if (scores.coding < 60) {
    suggestions.push({
      type: "study_plan",
      title: "Boost Your DSA Practice",
      content: "Solve 3 problems daily focusing on Arrays and HashMaps. Start with easy problems and gradually move to medium difficulty.",
      priority: "high",
    });
  }

  const weakSkills = data.skills.filter((s) => s.confidence < 50).slice(0, 3);
  weakSkills.forEach((skill) => {
    const courses = COURSE_DB[skill.name] || COURSE_DB["Data Structures"];
    suggestions.push({
      type: "course",
      title: `Improve ${skill.name}`,
      content: `Recommended: "${courses[0].title}" on ${courses[0].platform}. Your current confidence is ${skill.confidence}%.`,
      priority: "medium",
    });
  });

  if (data.projects.length < 3) {
    suggestions.push({
      type: "project",
      title: "Build a Full-Stack Project",
      content: "Create a project using React + Node.js + MongoDB with authentication, CRUD operations, and deployment.",
      priority: "high",
    });
  }

  if (scores.resume < 70) {
    suggestions.push({
      type: "resume",
      title: "Resume Optimization Needed",
      content: "Upload an updated resume. Add action verbs, quantify achievements, and include keywords matching your target role.",
      priority: "high",
    });
  }

  suggestions.push({
    type: "daily_task",
    title: "Today's Focus",
    content: `Complete 2 DSA problems, review ${weakSkills[0]?.name || "JavaScript"} for 30 minutes, and update skill confidence levels.`,
    priority: "medium",
  });

  return suggestions;
}

/** AI-enhanced suggestions — falls back to rule-based if AI unavailable */
export async function generateAiSuggestionsSmart(data: StudentData) {
  if (!isAiConfigured()) return generateAiSuggestions(data);

  try {
    const raw = await generateStructuredAi(
      `Based on this student profile, give exactly 5 personalized career suggestions as JSON array:
[{"type":"study_plan|course|project|resume|daily_task","title":"...","content":"...","priority":"high|medium|low"}]

Student data:
${buildStudentSummary(data)}

Return ONLY valid JSON array, no markdown.`,
      "You are a placement career coach AI. Return only valid JSON arrays."
    );
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fallback
  }
  return generateAiSuggestions(data);
}

export function generateInterviewQuestions(type: string, skill?: string) {
  const questions: Record<string, string[]> = {
    technical: [
      "Explain the difference between ArrayList and LinkedList in Java.",
      "What is the time complexity of binary search?",
      "How does React's virtual DOM work?",
      "Explain REST API principles and HTTP methods.",
      "What is the difference between SQL JOIN types?",
      `Describe a challenging ${skill || "coding"} problem you solved recently.`,
    ],
    hr: [
      "Tell me about yourself.",
      "What are your strengths and weaknesses?",
      "Why do you want to join our company?",
      "Describe a situation where you worked in a team.",
      "Where do you see yourself in 5 years?",
    ],
    sql: [
      "Write a query to find the second highest salary.",
      "Explain INNER JOIN vs LEFT JOIN with examples.",
      "How would you optimize a slow-running query?",
      "What are indexes and when should you use them?",
      "Write a query to find duplicate records in a table.",
    ],
    java: [
      "Explain OOP principles with real-world examples.",
      "What is the difference between HashMap and ConcurrentHashMap?",
      "Explain Java memory model — heap vs stack.",
      "What are Java 8 features you have used?",
      "How does garbage collection work in Java?",
    ],
    coding: [
      "Find two numbers that add up to a target sum.",
      "Reverse a linked list in-place.",
      "Find the longest substring without repeating characters.",
      "Implement a LRU cache.",
      "Detect cycle in a linked list.",
    ],
  };
  return questions[type] || questions.technical;
}

export async function generateInterviewQuestionsSmart(type: string, data: StudentData, skill?: string) {
  if (!isAiConfigured()) return generateInterviewQuestions(type, skill);

  try {
    const raw = await generateStructuredAi(
      `Generate 5 ${type} interview questions for a student targeting ${data.preferredRole || "SDE role"}.
Skills: ${data.skills.map((s) => s.name).join(", ")}
Return as JSON array of strings only. Example: ["Q1","Q2"]
Student level: ${data.skills.length > 5 ? "intermediate" : "beginner"}`,
      "Return ONLY a JSON array of question strings. No markdown."
    );
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(String);
  } catch {
    // fallback
  }
  return generateInterviewQuestions(type, skill);
}

export function generateWeeklyStudyPlan(data: StudentData) {
  const weakAreas = data.skills.filter((s) => s.confidence < 60).map((s) => s.name);
  const dsaTopics = ["Arrays", "Strings", "HashMap", "Trees", "Dynamic Programming"];

  return {
    monday: { focus: "DSA", task: `Solve 3 ${dsaTopics[0]} problems on LeetCode`, duration: "2 hours" },
    tuesday: { focus: weakAreas[0] || "Java", task: `Study ${weakAreas[0] || "core Java"} and build a mini project`, duration: "2 hours" },
    wednesday: { focus: "Aptitude", task: "Practice Logical Reasoning — 20 timed questions", duration: "1.5 hours" },
    thursday: { focus: "DSA", task: `Solve 2 medium ${dsaTopics[2]} problems`, duration: "2 hours" },
    friday: { focus: "Project", task: "Work on portfolio project — add documentation and tests", duration: "2 hours" },
    saturday: { focus: "Mock Interview", task: "Attend a technical mock interview and review feedback", duration: "1 hour" },
    sunday: { focus: "Review", task: "Review week's progress, update skills, plan next week", duration: "1 hour" },
  };
}

export async function generateWeeklyStudyPlanSmart(data: StudentData) {
  if (!isAiConfigured()) return generateWeeklyStudyPlan(data);

  try {
    const raw = await generateStructuredAi(
      `Create a personalized 7-day study plan for this student:
${buildStudentSummary(data)}

Return JSON object with keys monday-sunday, each having: focus, task, duration.
Example: {"monday":{"focus":"DSA","task":"...","duration":"2 hours"}}`,
      "Return ONLY valid JSON object. No markdown."
    );
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // fallback
  }
  return generateWeeklyStudyPlan(data);
}

export function explainWeakAreas(data: StudentData) {
  const scores = calculatePlacementReadiness(data);
  const areas: { area: string; score: number; advice: string }[] = [];

  const mapping: [string, number, string][] = [
    ["Coding / DSA", scores.coding, "Focus on pattern-based problem solving. Solve 5 problems per week minimum."],
    ["Technical Skills", scores.technical, "Complete online courses and build projects using each technology."],
    ["Aptitude", scores.aptitude, "Practice timed tests daily. Focus on weak categories."],
    ["Resume", scores.resume, "Use ATS-friendly format, add keywords, and quantify achievements."],
    ["Communication", scores.communication, "Practice mock HR interviews and improve English fluency."],
    ["Projects", scores.projects, "Deploy projects live, write README files, and add to GitHub."],
  ];

  mapping.forEach(([area, score, advice]) => {
    if (score < 70) areas.push({ area, score, advice });
  });

  return areas.sort((a, b) => a.score - b.score);
}

export async function analyzeResumeWithAi(
  fileName: string,
  skills: string[],
  targetRole?: string
): Promise<{
  atsScore: number; grammarScore: number; formattingScore: number;
  keywordScore: number; missingSkills: string[]; suggestions: string[];
  industryReady: number;
}> {
  if (!isAiConfigured()) {
    const { analyzeResume } = await import("../scoring");
    return analyzeResume(fileName, skills);
  }

  try {
    const raw = await generateStructuredAi(
      `Analyze resume "${fileName}" for a student targeting "${targetRole || "Software Developer"}" role.
Known skills: ${skills.join(", ")}

Return JSON only:
{"atsScore":0-100,"grammarScore":0-100,"formattingScore":0-100,"keywordScore":0-100,"industryReady":0-100,"missingSkills":["..."],"suggestions":["..."]}`,
      "You are an ATS resume expert. Return ONLY valid JSON."
    );
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    const { analyzeResume } = await import("../scoring");
    return analyzeResume(fileName, skills);
  }
}
