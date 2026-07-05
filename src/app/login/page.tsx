"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(data.user.role === "STUDENT" ? "/dashboard" : "/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center p-12">
        <div className="max-w-md text-white">
          <Sparkles className="h-12 w-12 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Welcome Back to SkillForge</h1>
          <p className="text-indigo-100 text-lg">Continue your placement preparation journey with AI-powered insights and personalized recommendations.</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access your dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="email" label="Email" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="relative">
              <Input id="password" label="Password" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="absolute right-3 top-9 text-slate-400" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-600 font-medium hover:underline">Register</Link>
          </p>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
            <p className="font-medium mb-1">Demo Accounts:</p>
            <p>Student: student@demo.com / demo123</p>
            <p>Admin: admin@demo.com / demo123</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
