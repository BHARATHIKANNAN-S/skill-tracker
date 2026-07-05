"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<{ id: string; type: string; technicalScore: number; hrScore: number; communicationScore: number; confidenceScore: number; problemSolvingScore: number; overallScore: number; feedback?: string; suggestions?: string; conductedAt: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "Technical", technicalScore: 70, hrScore: 65, communicationScore: 75, confidenceScore: 60, problemSolvingScore: 70, feedback: "", suggestions: "" });

  function load() { fetch("/api/student/interviews").then((r) => r.json()).then((d) => setInterviews(d.interviews || [])); }
  useEffect(() => { load(); }, []);

  async function add() {
    await fetch("/api/student/interviews", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setShowForm(false);
    load();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Mock Interviews</h1>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> Record Interview</Button>
        </div>

        {showForm && (
          <Card>
            <div className="grid gap-4 sm:grid-cols-3">
              {(["technicalScore", "hrScore", "communicationScore", "confidenceScore", "problemSolvingScore"] as const).map((field) => (
                <Input key={field} label={field.replace("Score", " Score").replace(/([A-Z])/g, " $1")} type="number" min={0} max={100}
                  value={form[field]} onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })} />
              ))}
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Feedback</label>
                <textarea className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} />
              </div>
              <div className="sm:col-span-3"><Button onClick={add} className="w-full">Save Interview</Button></div>
            </div>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {interviews.map((iv) => (
            <Card key={iv.id} hover>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{iv.type} Interview</h3>
                  <p className="text-xs text-slate-500">{formatDate(iv.conductedAt)}</p>
                </div>
                <div className="text-3xl font-bold text-indigo-600">{iv.overallScore}%</div>
              </div>
              <div className="space-y-2">
                <ProgressBar value={iv.technicalScore} label="Technical" color="bg-indigo-500" />
                <ProgressBar value={iv.hrScore} label="HR" color="bg-emerald-500" />
                <ProgressBar value={iv.communicationScore} label="Communication" color="bg-amber-500" />
                <ProgressBar value={iv.confidenceScore} label="Confidence" color="bg-rose-500" />
                <ProgressBar value={iv.problemSolvingScore} label="Problem Solving" color="bg-purple-500" />
              </div>
              {iv.feedback && <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{iv.feedback}</p>}
            </Card>
          ))}
        </div>
        {interviews.length === 0 && <Card className="text-center py-12"><p className="text-slate-500">No mock interviews recorded yet.</p></Card>}
      </div>
    </DashboardLayout>
  );
}
