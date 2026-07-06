import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";
import { ACHIEVEMENT_DEFINITIONS } from "../src/lib/constants";
import { getQuestionsList } from "../src/lib/questions-data";

const prisma = new PrismaClient();

const javaSolutionTemplate = (title: string) => `public class Solution {
    // LeetCode: ${title}
    public int solve() {
        // Implement your optimal Java solution here
        return 0;
    }
}`;

const cppSolutionTemplate = (title: string) => `#include <iostream>
using namespace std;

class Solution {
public:
    // LeetCode: ${title}
    int solve() {
        // Implement your optimal C++ solution here
        return 0;
    }
};`;

const pythonSolutionTemplate = (title: string) => `class Solution:
    # LeetCode: ${title}
    def solve(self) -> int:
        # Implement your optimal Python solution here
        return 0
`;

const jsSolutionTemplate = (title: string) => `/**
 * LeetCode: ${title}
 */
function solve() {
    // Implement your optimal JavaScript solution here
    return 0;
}
`;

async function main() {
  console.log("Seeding database...");

  // Upsert Admin and Student demo users
  const adminHash = await hashPassword("demo123");
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: adminHash,
      role: "ADMIN",
      emailVerified: true,
    },
  });

  const studentHash = await hashPassword("demo123");
  const studentUser = await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      email: "student@demo.com",
      password: studentHash,
      role: "STUDENT",
      emailVerified: true,
      studentProfile: {
        create: {
          name: "Arjun Kumar",
          department: "Computer Science",
          college: "IIT Madras",
          year: 4,
          registerNumber: "CS2022001",
          phone: "+91 9876543210",
          linkedin: "https://linkedin.com/in/arjunkumar",
          github: "https://github.com/arjunkumar",
          preferredRole: "Full Stack Developer",
          careerGoal: "Join a top product company as SDE",
          languagesKnown: "English, Hindi, Tamil",
          bio: "Passionate full-stack developer with strong DSA skills.",
          xp: 1250,
          coins: 85,
          level: 5,
          codingStreak: 12,
        },
      },
    },
    include: { studentProfile: true },
  });

  const studentId = studentUser.studentProfile!.id;

  // Seeding skills
  const skills = [
    { name: "Java", level: "Advanced", confidence: 85, learningStatus: "EXPERT" as const, experience: "2 years" },
    { name: "Python", level: "Intermediate", confidence: 70, learningStatus: "COMPLETED" as const, experience: "1 year" },
    { name: "React", level: "Advanced", confidence: 80, learningStatus: "EXPERT" as const, experience: "1.5 years" },
    { name: "JavaScript", level: "Advanced", confidence: 82, learningStatus: "EXPERT" as const, experience: "2 years" },
    { name: "SQL", level: "Intermediate", confidence: 75, learningStatus: "COMPLETED" as const, experience: "1 year" },
    { name: "NodeJS", level: "Intermediate", confidence: 68, learningStatus: "IN_PROGRESS" as const, experience: "8 months" },
    { name: "Docker", level: "Beginner", confidence: 45, learningStatus: "IN_PROGRESS" as const, experience: "3 months" },
    { name: "Communication", level: "Intermediate", confidence: 72, learningStatus: "IN_PROGRESS" as const, experience: "Ongoing" },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { studentId_name: { studentId, name: skill.name } },
      create: { ...skill, studentId },
      update: skill,
    });
  }

  // Seeding projects
  const projects = [
    { name: "E-Commerce Platform", description: "Full-stack e-commerce with React, Node.js, MongoDB, payment integration, and admin dashboard.", technologies: "React,NodeJS,MongoDB,Stripe", status: "DEPLOYED" as const, difficulty: "HARD" as const, qualityScore: 88, githubUrl: "https://github.com/demo/ecommerce", liveDemo: "https://demo-ecommerce.vercel.app", role: "Full Stack Lead", teamSize: 3, duration: "3 months" },
    { name: "AI Chat Assistant", description: "Real-time chat application with WebSocket, OpenAI integration, and user authentication.", technologies: "React,NodeJS,Socket.io,OpenAI", status: "COMPLETED" as const, difficulty: "MEDIUM" as const, qualityScore: 75, githubUrl: "https://github.com/demo/chat", role: "Backend Developer", teamSize: 2, duration: "2 months" },
    { name: "Task Management App", description: "Kanban-style task manager with drag-and-drop, team collaboration, and notifications.", technologies: "React,TypeScript,Firebase", status: "COMPLETED" as const, difficulty: "MEDIUM" as const, qualityScore: 70, githubUrl: "https://github.com/demo/tasks", role: "Solo Developer", teamSize: 1, duration: "1 month" },
  ];

  for (const project of projects) {
    const existing = await prisma.project.findFirst({ where: { studentId, name: project.name } });
    if (!existing) await prisma.project.create({ data: { ...project, studentId } });
  }

  // Retrieve 500 questions (20 per topic) statically defined in code
  const finalQuestions = getQuestionsList();

  // Clear existing questions to avoid duplicate slug violations
  await prisma.dsaQuestion.deleteMany({});

  console.log(`Clearing completed. Seeding ${finalQuestions.length} curated LeetCode questions (20 per topic)...`);

  for (const q of finalQuestions) {
    const examples = [
      { input: "See original LeetCode link.", output: "Matches LeetCode expectations.", explanation: "Verify constraints." }
    ];
    const hints = [
      "Understand the problem constraints and target data size.",
      "Check if sorting or hash map simplifies the search space.",
      "Analyze the optimal time and space complexity limit."
    ];

    await prisma.dsaQuestion.create({
      data: {
        leetcodeId: q.id,
        title: q.title,
        slug: q.slug,
        difficulty: q.diff,
        topic: q.topic,
        leetcodeUrl: q.url,
        acceptanceRate: q.rate,
        estimatedTime: q.time,
        isPremium: false,
        frequency: q.freq,
        description: `This is the curated LeetCode problem "${q.title}" for the topic "${q.topic}". Use the link above to view details, constraints, and submit your solution.`,
        constraints: "Check the original LeetCode link for precise constraints.",
        examples: JSON.stringify(examples),
        hints: JSON.stringify(hints),
        tags: JSON.stringify(q.tags),
        companies: JSON.stringify(q.companies),
        similarQuestions: JSON.stringify([]),
        javaSolution: javaSolutionTemplate(q.title),
        cppSolution: cppSolutionTemplate(q.title),
        pythonSolution: pythonSolutionTemplate(q.title),
        javascriptSolution: jsSolutionTemplate(q.title),
        timeComplexity: "O(N) or O(N log N)",
        spaceComplexity: "O(1) or O(N)"
      }
    });
  }

  // Seeding achievements
  await prisma.achievement.deleteMany({});
  for (const a of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievement.upsert({
      where: { name: a.name },
      create: a,
      update: a,
    });
  }

  // Seeding courses
  await prisma.course.deleteMany({});
  await prisma.course.createMany({
    data: [
      { title: "Complete Java Masterclass", description: "Comprehensive Java programming course", platform: "Udemy", skillTags: "Java,OOP,Spring", duration: "40 hours", level: "Beginner to Advanced" },
      { title: "React - The Complete Guide", description: "Modern React with hooks and Redux", platform: "Udemy", skillTags: "React,JavaScript,Redux", duration: "48 hours", level: "Intermediate" },
      { title: "DSA in Python", description: "Data structures and algorithms", platform: "Coursera", skillTags: "Python,DSA,Algorithms", duration: "30 hours", level: "Intermediate" },
    ],
  });

  // Seeding placement drives
  await prisma.placementDrive.deleteMany({});
  await prisma.placementDrive.createMany({
    data: [
      { company: "Google", role: "Software Engineer", package: "45 LPA", deadline: new Date("2026-08-15"), requirements: "Strong DSA, System Design", description: "Campus hiring for SWE role" },
      { company: "Microsoft", role: "SDE-1", package: "38 LPA", deadline: new Date("2026-09-01"), requirements: "C++/Java, DSA, OOP", description: "Full-time SDE position" },
      { company: "Amazon", role: "SDE Intern", package: "1.2L/month", deadline: new Date("2026-07-20"), requirements: "DSA, Problem Solving", description: "6-month internship program" },
    ],
  });

  // Creating a welcome notification
  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: "Welcome to SkillForge!",
      message: "Complete your profile and start tracking your placement readiness journey.",
      type: "info",
    },
  });

  // Seeding other demo students
  const demoStudents = [
    { name: "Priya Sharma", email: "priya@demo.com", college: "NIT Trichy", xp: 980 },
    { name: "Rahul Verma", email: "rahul@demo.com", college: "BITS Pilani", xp: 1100 },
    { name: "Ananya Patel", email: "ananya@demo.com", college: "VIT Vellore", xp: 870 },
  ];

  for (const ds of demoStudents) {
    const hash = await hashPassword("demo123");
    await prisma.user.upsert({
      where: { email: ds.email },
      update: {},
      create: {
        email: ds.email,
        password: hash,
        role: "STUDENT",
        emailVerified: true,
        studentProfile: {
          create: {
            name: ds.name,
            college: ds.college,
            department: "Computer Science",
            year: 4,
            xp: ds.xp,
            coins: 50,
            level: 4,
            codingStreak: Math.floor(Math.random() * 20) + 1,
          },
        },
      },
    });
  }

  console.log("Seed completed!");
  console.log(`Curated ${finalQuestions.length} LeetCode problems.`);
  console.log("Demo accounts:");
  console.log("  Student: student@demo.com / demo123");
  console.log("  Admin: admin@demo.com / demo123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
