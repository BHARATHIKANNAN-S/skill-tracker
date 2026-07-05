"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress";
import { Target, Plus, CheckCircle2 } from "lucide-react";

interface WeeklyGoal {
  id: string;
  title: string;
  description?: string | null;
  target: number;
  progress: number;
  dueDate: string;
  completed: boolean;
}

export default function WeeklyGoalsPage() {
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target: 1, progress: 0, dueDate: "" });

  function load() {
    fetch("/api/student/weekly-goals")
      .then((r) => r.json())
      .then((d) => setGoals(d.goals || []));
  }

  useEffect(() => { load(); }, []);

  async function addGoal() {
    if (!form.title || !form.dueDate) return;
    await fetch("/api/student/weekly-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, target: Number(form.target), progress: Number(form.progress) }),
    });
    setShowForm(false);
    setForm({ title: "", description: "", target: 1, progress: 0, dueDate: "" });
    load();
  }

  async function updateGoal(goal: WeeklyGoal, delta: number) {
    const nextProgress = Math.min(goal.target, Math.max(0, goal.progress + delta));
    const completed = nextProgress >= goal.target;
    await fetch(`/api/student/weekly-goals?id=${goal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: nextProgress, completed }),
    });
    load();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Target className="h-6 w-6 text-indigo-500" /> Weekly Goals</h1>
            <p className="text-slate-500 text-sm mt-1">Plan your weekly focus and track progress.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> Add Goal</Button>
        </div>

        {showForm && (
          <Card className="space-y-4">
            <Input label="Goal title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Target" type="number" min={1} value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} />
              <Input label="Progress" type="number" min={0} value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} />
              <Input label="Due date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <Button onClick={addGoal} className="w-full md:w-auto">Save Goal</Button>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.progress / goal.target) * 100));
            return (
              <Card key={goal.id} hover className={goal.completed ? "border-emerald-200 bg-emerald-50/50" : ""}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{goal.title}</h3>
                    {goal.description && <p className="text-sm text-slate-600 mt-1">{goal.description}</p>}
                    <p className="text-xs text-slate-500 mt-2">Due: {new Date(goal.dueDate).toLocaleDateString()}</p>
                  </div>
                  {goal.completed && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                </div>
                <div className="mt-4">
                  <ProgressBar value={percent} label={`${goal.progress}/${goal.target}`} color="bg-indigo-600" />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => updateGoal(goal, -1)} disabled={goal.progress <= 0}>-1</Button>
                  <Button onClick={() => updateGoal(goal, 1)} disabled={goal.completed}>+1</Button>
                </div>
              </Card>
            );
          })}
        </div>

        {goals.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-slate-500">No weekly goals yet. Add one to start planning your week.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
