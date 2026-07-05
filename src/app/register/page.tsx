"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { DEPARTMENTS } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    department: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      // Register success → Dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Create Your Account
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Start your placement readiness journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Full Name"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@college.edu"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />

          <Input
            id="college"
            label="College"
            placeholder="Your College Name"
            value={form.college}
            onChange={(e) => update("college", e.target.value)}
          />

          <Select
            id="department"
            label="Department"
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
            options={[
              { value: "", label: "Select Department" },
              ...DEPARTMENTS.map((d) => ({
                value: d,
                label: d,
              })),
            ]}
          />

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}