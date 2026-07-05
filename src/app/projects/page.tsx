"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Plus, Trash2, ExternalLink } from "lucide-react";

interface Project {
  id: string; name: string; description: string; technologies: string;
  status: string; difficulty: string; qualityScore: number;
  githubUrl?: string; liveDemo?: string; role?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", technologies: "", duration: "", teamSize: 1,
    role: "", githubUrl: "", liveDemo: "", status: "IN_PROGRESS", difficulty: "MEDIUM",
  });

  function load() {
    fetch("/api/student/projects").then((r) => r.json()).then((d) => setProjects(d.projects || []));
  }
  useEffect(() => { load(); }, []);

  async function add() {
    await fetch("/api/student/projects", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, teamSize: Number(form.teamSize) }),
    });
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/student/projects?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> Add Project</Button>
        </div>

        {showForm && (
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Project Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Technologies (comma-separated)" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea className="w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <Input label="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 2 months" />
              <Input label="Team Size" type="number" value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: Number(e.target.value) })} />
              <Input label="Your Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              <Input label="GitHub URL" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
              <Input label="Live Demo URL" value={form.liveDemo} onChange={(e) => setForm({ ...form, liveDemo: e.target.value })} />
              <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={[
                  { value: "PLANNED", label: "Planned" }, { value: "IN_PROGRESS", label: "In Progress" },
                  { value: "COMPLETED", label: "Completed" }, { value: "DEPLOYED", label: "Deployed" },
                ]} />
              <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                options={[
                  { value: "EASY", label: "Easy" }, { value: "MEDIUM", label: "Medium" },
                  { value: "HARD", label: "Hard" }, { value: "EXPERT", label: "Expert" },
                ]} />
              <div className="sm:col-span-2"><Button onClick={add} className="w-full">Create Project</Button></div>
            </div>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">{p.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                </div>
                <button onClick={() => remove(p.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.technologies.split(",").map((t) => (
                  <Badge key={t} variant="info">{t.trim()}</Badge>
                ))}
              </div>
              <div className="mt-4">
                <ProgressBar value={p.qualityScore} label="Quality Score" color="bg-emerald-500" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant={p.status === "DEPLOYED" ? "success" : "warning"}>{p.status}</Badge>
                  <Badge variant="purple">{p.difficulty}</Badge>
                </div>
                <div className="flex gap-2">
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 text-slate-400 hover:text-indigo-600" /></a>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
