import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, id, data } = body;

  switch (action) {
    case "approve-cert":
      await prisma.certification.update({ where: { id }, data: { approved: true } });
      return NextResponse.json({ message: "Certificate approved" });
    case "toggle-student":
      const cert = await prisma.certification.findUnique({ where: { id }, select: { studentId: true } });
      if (cert) {
        const student = await prisma.studentProfile.findUnique({ where: { id: cert.studentId } });
        if (student) {
          await prisma.user.update({ where: { id: student.userId }, data: { isActive: data.isActive } });
        }
      }
      return NextResponse.json({ message: "Student updated" });
    case "create-course":
      const course = await prisma.course.create({ data });
      return NextResponse.json({ course });
    case "create-drive":
      const drive = await prisma.placementDrive.create({
        data: { ...data, deadline: new Date(data.deadline) },
      });
      return NextResponse.json({ drive });
    case "send-notification":
      const students = await prisma.studentProfile.findMany({ select: { userId: true } });
      for (const s of students) {
        await prisma.notification.create({
          data: { userId: s.userId, title: data.title, message: data.message, type: data.type || "info" },
        });
      }
      return NextResponse.json({ message: "Notifications sent" });
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
