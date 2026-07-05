import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [students, courses, drives, certs, notifications] = await Promise.all([
    prisma.studentProfile.findMany({
      include: { user: { select: { email: true, isActive: true, lastLoginAt: true } }, skills: true, projects: true, dsaProblems: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.placementDrive.findMany({ orderBy: { deadline: "asc" } }),
    prisma.certification.findMany({ where: { approved: false }, include: { student: { select: { name: true } } } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const deptStats = students.reduce((acc, s) => {
    const dept = s.department || "Unknown";
    if (!acc[dept]) acc[dept] = { count: 0, totalXp: 0 };
    acc[dept].count++;
    acc[dept].totalXp += s.xp;
    return acc;
  }, {} as Record<string, { count: number; totalXp: number }>);

  return NextResponse.json({
    stats: {
      totalStudents: students.length,
      activeStudents: students.filter((s) => s.user.isActive).length,
      pendingCerts: certs.length,
      totalCourses: courses.length,
      upcomingDrives: drives.filter((d) => d.isActive && new Date(d.deadline) > new Date()).length,
    },
    students,
    courses,
    drives,
    pendingCerts: certs,
    notifications,
    deptStats,
  });
}
