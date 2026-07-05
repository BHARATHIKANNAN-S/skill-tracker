"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SKILL_OPTIONS, SKILL_LEVELS } from "@/lib/constants";
import { Plus, Trash2 } from "lucide-react";

interface Skill {
  id: string; name: string; level: string; confidence: number;
  learningStatus: string; experience?: string; lastUpdated: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", level: "Beginner", confidence: 50, learningStatus: "IN_PROGRESS", experience: "" });

  function load() {
    fetch("/api/student/skills").then((r) => r.json()).then((d) => setSkills(d.skills || []));
  }

  useEffect(() => { load(); }, []);

  async function addSkill() {
    await fetch("/api/student/skills", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, confidence: Number(form.confidence) }),
    });
    setShowForm(false);
    setForm({ name: "", level: "Beginner", confidence: 50, learningStatus: "IN_PROGRESS", experience: "" });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/student/skills?id=${id}`, { method: "DELETE" });
    load();
  }

  const statusColors: Record<string, "success" | "warning" | "info" | "purple"> = {
    EXPERT: "purple", COMPLETED: "success", IN_PROGRESS: "info", NOT_STARTED: "warning",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Skill Management</h1>
            <p className="text-slate-500 text-sm mt-1">{skills.length} skills tracked</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> Add Skill</Button>
        </div>

        {showForm && (
          <Card>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select label="Skill" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                options={[{ value: "", label: "Select skill" }, ...SKILL_OPTIONS.map((s) => ({ value: s, label: s }))]} />
              <Select label="Level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                options={SKILL_LEVELS.map((l) => ({ value: l, label: l }))} />
              <Input label="Confidence %" type="number" min={0} max={100} value={form.confidence} onChange={(e) => setForm({ ...form, confidence: Number(e.target.value) })} />
              <Select label="Status" value={form.learningStatus} onChange={(e) => setForm({ ...form, learningStatus: e.target.value })}
                options={[
                  { value: "NOT_STARTED", label: "Not Started" },
                  { value: "IN_PROGRESS", label: "In Progress" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "EXPERT", label: "Expert" },
                ]} />
              <Input label="Experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 6 months" />
              <div className="flex items-end"><Button onClick={addSkill} className="w-full">Save Skill</Button></div>
            </div>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id} hover>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{skill.name}</h3>
                  <p className="text-xs text-slate-500">{skill.level} • {skill.experience || "No experience noted"}</p>
                </div>
                <button onClick={() => remove(skill.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
              <ProgressBar value={skill.confidence} label="Confidence" color="bg-indigo-600" />
              <div className="mt-3 flex items-center justify-between">
                <Badge variant={statusColors[skill.learningStatus] || "default"}>
                  {skill.learningStatus.replace("_", " ")}
                </Badge>
                <span className="text-xs text-slate-400">Updated {new Date(skill.lastUpdated).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
        {skills.length === 0 && (
          <Card className="text-center py-12">
            <p className="text-slate-500">No skills added yet. Click &quot;Add Skill&quot; to get started.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
