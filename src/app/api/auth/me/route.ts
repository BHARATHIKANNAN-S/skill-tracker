import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, generateOtp } from "@/lib/auth";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "If the email exists, an OTP has been sent" });
    }

    const otp = generateOtp();
    await prisma.otp.upsert({
      where: { userId: user.id },
      create: { userId: user.id, code: otp, type: "reset", expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      update: { code: otp, type: "reset", expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });

    return NextResponse.json({
      message: "OTP sent to your email",
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6).optional(),
  type: z.enum(["verification", "reset"]).default("verification"),
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = verifySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

    const otpRecord = await prisma.otp.findUnique({ where: { userId: user.id } });
    if (!otpRecord || otpRecord.code !== data.otp || otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    if (data.type === "reset" && data.newPassword) {
      const { hashPassword } = await import("@/lib/auth");
      await prisma.user.update({
        where: { id: user.id },
        data: { password: await hashPassword(data.newPassword) },
      });
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    }

    await prisma.otp.delete({ where: { userId: user.id } });
    return NextResponse.json({ message: "Verification successful" });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, email: true, role: true, emailVerified: true,
      studentProfile: { select: { id: true, name: true, photo: true, level: true, xp: true, coins: true } },
    },
  });
  return NextResponse.json({ user });
}
