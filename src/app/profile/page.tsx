"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { DEPARTMENTS, YEARS } from "@/lib/constants";
import { calculateProfileCompletion } from "@/lib/scoring";
import { Save } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/student/profile").then((r) => r.json()).then((d) => {
      setProfile(d.profile || {});
      setLoading(false);
    });
  }, []);

  function update(field: string, value: string | number) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/student/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (res.ok) setMessage("Profile saved successfully!");
    setSaving(false);
  }

  const completion = calculateProfileCompletion(profile as never);

  if (loading) return <DashboardLayout><div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div></DashboardLayout>;

  return (
    <DashboardLayout user={profile as never}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <Button onClick={save} disabled={saving}><Save className="h-4 w-4" />{saving ? "Saving..." : "Save Profile"}</Button>
        </div>
        {message && <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">{message}</p>}
        <Card>
          <ProgressBar value={completion} label="Profile Completion" color="bg-indigo-600" />
        </Card>
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={String(profile.name || "")} onChange={(e) => update("name", e.target.value)} />
            <Input label="Register Number" value={String(profile.registerNumber || "")} onChange={(e) => update("registerNumber", e.target.value)} />
            <Input label="Phone" value={String(profile.phone || "")} onChange={(e) => update("phone", e.target.value)} />
            <Input label="College" value={String(profile.college || "")} onChange={(e) => update("college", e.target.value)} />
            <Select label="Department" value={String(profile.department || "")} onChange={(e) => update("department", e.target.value)}
              options={[{ value: "", label: "Select" }, ...DEPARTMENTS.map((d) => ({ value: d, label: d }))]} />
            <Select label="Year" value={String(profile.year || "")} onChange={(e) => update("year", Number(e.target.value))}
              options={[{ value: "", label: "Select" }, ...YEARS.map((y) => ({ value: String(y), label: `Year ${y}` }))]} />
            <Input label="Languages Known" value={String(profile.languagesKnown || "")} onChange={(e) => update("languagesKnown", e.target.value)} />
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Career & Social</CardTitle></CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Preferred Job Role" value={String(profile.preferredRole || "")} onChange={(e) => update("preferredRole", e.target.value)} />
            <Input label="Career Goal" value={String(profile.careerGoal || "")} onChange={(e) => update("careerGoal", e.target.value)} />
            <Input label="LinkedIn" value={String(profile.linkedin || "")} onChange={(e) => update("linkedin", e.target.value)} />
            <Input label="GitHub" value={String(profile.github || "")} onChange={(e) => update("github", e.target.value)} />
            <Input label="Portfolio" value={String(profile.portfolio || "")} onChange={(e) => update("portfolio", e.target.value)} className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
              <textarea className="w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[100px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={String(profile.bio || "")} onChange={(e) => update("bio", e.target.value)} placeholder="Tell us about yourself..." />
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
