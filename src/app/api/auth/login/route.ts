import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { toRole } from "@/types";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { studentProfile: true },
    });

    if (!user || !(await verifyPassword(data.password, user.password))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    if (user.studentProfile) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastLogin = user.studentProfile.lastLoginDate;
      let newStreak = user.studentProfile.codingStreak;

      if (lastLogin) {
        const lastDate = new Date(lastLogin);
        lastDate.setHours(0, 0, 0, 0);
        const diff = (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) newStreak += 1;
        else if (diff > 1) newStreak = 1;
      } else {
        newStreak = 1;
      }

      await prisma.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: { lastLoginDate: today, codingStreak: newStreak },
      });

      await prisma.loginStreak.upsert({
        where: { userId_date: { userId: user.id, date: today } },
        create: { userId: user.id, date: today },
        update: {},
      });
    }

    const token = signToken({ userId: user.id, email: user.email, role: toRole(user.role) });
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.studentProfile?.name,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
