import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth";

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
