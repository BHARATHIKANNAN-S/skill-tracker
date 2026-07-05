"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, type: "verification" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Verify Your Email</h2>
        <p className="text-sm text-slate-500 mt-1">Enter the 6-digit OTP sent to {email}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="otp" label="OTP Code" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
        {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href="/login" className="text-indigo-600 hover:underline">Back to Login</Link>
      </p>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
      <Suspense><VerifyForm /></Suspense>
    </div>
  );
}
