import type { StudentProfile, Skill, Project, Certification, DsaProblem, AptitudeTest, MockInterview, Resume } from "@prisma/client";

export type StudentData = StudentProfile & {
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  dsaProblems: DsaProblem[];
  aptitudeTests: AptitudeTest[];
  mockInterviews: MockInterview[];
  resumes: Resume[];
};

export interface PlacementScores {
  overall: number;
  profileCompletion: number;
  resume: number;
  technical: number;
  communication: number;
  coding: number;
  aptitude: number;
  projects: number;
  certifications: number;
  interviews: number;
  consistency: number;
  status: "READY" | "ALMOST_READY" | "NEEDS_IMPROVEMENT";
  explanation: string[];
}

export function calculateProfileCompletion(profile: StudentProfile): number {
  const fields = [
    profile.name, profile.department, profile.college, profile.year,
    profile.registerNumber, profile.phone, profile.linkedin, profile.github,
    profile.portfolio, profile.preferredRole, profile.careerGoal, profile.bio, profile.photo,
  ];
  const filled = fields.filter((f) => f != null && f !== "").length;
  return Math.round((filled / fields.length) * 100);
}

export function calculateResumeScore(resumes: Resume[]): number {
  if (resumes.length === 0) return 0;
  const active = resumes.find((r) => r.isActive) || resumes[0];
  return Math.round((active.atsScore + active.grammarScore + active.formattingScore + active.keywordScore + active.industryReady) / 5);
}

export function calculateTechnicalScore(skills: Skill[]): number {
  if (skills.length === 0) return 0;
  const avg = skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length;
  const expertBonus = skills.filter((s) => s.learningStatus === "EXPERT").length * 5;
  return Math.min(100, Math.round(avg + expertBonus));
}

export function calculateCodingScore(problems: DsaProblem[]): number {
  if (problems.length === 0) return 0;
  const easy = problems.filter((p) => p.difficulty === "EASY").length;
  const medium = problems.filter((p) => p.difficulty === "MEDIUM").length;
  const hard = problems.filter((p) => p.difficulty === "HARD" || p.difficulty === "EXPERT").length;
  const score = easy * 2 + medium * 5 + hard * 10;
  return Math.min(100, Math.round(score / Math.max(problems.length, 1) * 3));
}

export function calculateAptitudeScore(tests: AptitudeTest[]): number {
  if (tests.length === 0) return 0;
  const recent = tests.slice(-10);
  const avg = recent.reduce((sum, t) => sum + (t.correctAnswers / t.totalQuestions) * 100, 0) / recent.length;
  return Math.round(avg);
}

export function calculateProjectScore(projects: Project[]): number {
  if (projects.length === 0) return 0;
  const completed = projects.filter((p) => p.status === "COMPLETED" || p.status === "DEPLOYED");
  const avgQuality = projects.reduce((sum, p) => sum + p.qualityScore, 0) / projects.length;
  const countBonus = Math.min(30, completed.length * 10);
  return Math.min(100, Math.round(avgQuality * 0.7 + countBonus));
}

export function calculateCertificationScore(certs: Certification[]): number {
  const approved = certs.filter((c) => c.approved);
  return Math.min(100, approved.length * 15 + certs.length * 5);
}

export function calculateInterviewScore(interviews: MockInterview[]): number {
  if (interviews.length === 0) return 0;
  const recent = interviews.slice(-5);
  const avg = recent.reduce((sum, i) => sum + i.overallScore, 0) / recent.length;
  return Math.round(avg);
}

export function calculateCommunicationScore(skills: Skill[], interviews: MockInterview[]): number {
  const commSkill = skills.find((s) => s.name.toLowerCase().includes("communication"));
  const skillScore = commSkill?.confidence || 0;
  const interviewComm = interviews.length > 0
    ? interviews.slice(-3).reduce((s, i) => s + i.communicationScore, 0) / Math.min(3, interviews.length)
    : 0;
  return Math.round(skillScore * 0.4 + interviewComm * 0.6);
}

export function calculateConsistencyScore(profile: StudentProfile, problems: DsaProblem[]): number {
  const streakBonus = Math.min(40, profile.codingStreak * 4);
  const recentProblems = problems.filter((p) => {
    const days = (Date.now() - new Date(p.solvedAt).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 30;
  });
  const activityScore = Math.min(60, recentProblems.length * 3);
  return Math.min(100, streakBonus + activityScore);
}

export function calculatePlacementReadiness(data: StudentData): PlacementScores {
  const profileCompletion = calculateProfileCompletion(data);
  const resume = calculateResumeScore(data.resumes);
  const technical = calculateTechnicalScore(data.skills);
  const coding = calculateCodingScore(data.dsaProblems);
  const aptitude = calculateAptitudeScore(data.aptitudeTests);
  const projects = calculateProjectScore(data.projects);
  const certifications = calculateCertificationScore(data.certifications);
  const interviews = calculateInterviewScore(data.mockInterviews);
  const communication = calculateCommunicationScore(data.skills, data.mockInterviews);
  const consistency = calculateConsistencyScore(data, data.dsaProblems);

  const weights = {
    profileCompletion: 0.05,
    resume: 0.12,
    technical: 0.15,
    coding: 0.18,
    aptitude: 0.10,
    projects: 0.12,
    certifications: 0.05,
    interviews: 0.10,
    communication: 0.08,
    consistency: 0.05,
  };

  const overall = Math.round(
    profileCompletion * weights.profileCompletion +
    resume * weights.resume +
    technical * weights.technical +
    coding * weights.coding +
    aptitude * weights.aptitude +
    projects * weights.projects +
    certifications * weights.certifications +
    interviews * weights.interviews +
    communication * weights.communication +
    consistency * weights.consistency
  );

  let status: PlacementScores["status"] = "NEEDS_IMPROVEMENT";
  if (overall >= 75) status = "READY";
  else if (overall >= 55) status = "ALMOST_READY";

  const explanation: string[] = [];
  if (coding < 50) explanation.push("Increase DSA practice — aim for 50+ problems across difficulty levels.");
  if (resume < 60) explanation.push("Improve your resume ATS score with relevant keywords and formatting.");
  if (projects < 50) explanation.push("Complete and deploy more projects with proper documentation.");
  if (technical < 50) explanation.push("Strengthen core technical skills and update confidence levels.");
  if (aptitude < 60) explanation.push("Practice aptitude tests regularly to improve accuracy.");
  if (interviews < 50) explanation.push("Attend more mock interviews to build confidence.");
  if (profileCompletion < 80) explanation.push("Complete your profile to improve visibility to recruiters.");
  if (consistency < 40) explanation.push("Maintain daily coding streak for better consistency score.");
  if (explanation.length === 0) explanation.push("Excellent progress! Keep maintaining your streak and practicing mock interviews.");

  return {
    overall, profileCompletion, resume, technical, communication, coding,
    aptitude, projects: projects, certifications, interviews, consistency, status, explanation,
  };
}

export function calculateProjectQuality(project: {
  technologies: string;
  description: string;
  githubUrl?: string | null;
  liveDemo?: string | null;
  documents?: string | null;
  difficulty: string;
  teamSize?: number | null;
}): number {
  let score = 30;
  const techCount = project.technologies.split(",").filter(Boolean).length;
  score += Math.min(20, techCount * 4);
  if (project.description.length > 100) score += 10;
  if (project.githubUrl) score += 15;
  if (project.liveDemo) score += 15;
  if (project.documents) score += 10;
  if (project.difficulty === "HARD" || project.difficulty === "EXPERT") score += 10;
  if (project.teamSize && project.teamSize > 1) score += 5;
  return Math.min(100, score);
}

export function analyzeResume(fileName: string, skills: string[]): {
  atsScore: number; grammarScore: number; formattingScore: number;
  keywordScore: number; missingSkills: string[]; suggestions: string[];
  industryReady: number;
} {
  const commonKeywords = ["javascript", "python", "java", "react", "sql", "git", "api", "project", "experience"];
  const studentSkillsLower = skills.map((s) => s.toLowerCase());
  const missingSkills = ["Docker", "AWS", "System Design", "CI/CD"].filter(
    (s) => !studentSkillsLower.some((ss) => ss.includes(s.toLowerCase()))
  );
  const keywordScore = Math.min(100, 40 + studentSkillsLower.length * 8);
  const atsScore = Math.min(100, 50 + Math.floor(Math.random() * 30) + (fileName.includes("resume") ? 10 : 0));
  const grammarScore = Math.min(100, 65 + Math.floor(Math.random() * 25));
  const formattingScore = Math.min(100, 70 + Math.floor(Math.random() * 20));
  const industryReady = Math.round((atsScore + keywordScore + grammarScore) / 3);
  const suggestions = [
    "Add quantifiable achievements with metrics (e.g., improved performance by 40%).",
    "Include relevant keywords from job descriptions for your target role.",
    "Keep resume to 1 page for fresher roles.",
    ...missingSkills.slice(0, 2).map((s) => `Consider adding ${s} to your skill section.`),
  ];
  return { atsScore, grammarScore, formattingScore, keywordScore, missingSkills, suggestions, industryReady };
}
