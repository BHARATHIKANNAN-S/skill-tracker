"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Sparkles } from "lucide-react";

interface Question {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  platform: string;
  description?: string;
  url?: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");

  function load() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (topic) params.set("topic", topic);
    if (difficulty) params.set("difficulty", difficulty);
    fetch(`/api/student/questions?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setQuestions(d.problems || []));
  }

  useEffect(() => { load(); }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><BookOpen className="h-6 w-6 text-indigo-500" /> DSA Question Bank</h1>
          <p className="text-slate-500 text-sm mt-1">Browse curated DSA problems by topic, difficulty, and platform.</p>
        </div>

        <Card className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search problems" />
            <Input label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Arrays" />
            <Input label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} placeholder="Easy" />
          </div>
          <Button onClick={load}><Search className="h-4 w-4" /> Search</Button>
        </Card>

        <div className="grid gap-4">
          {questions.map((q) => (
            <Card key={q.id} hover>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{q.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{q.description || "Practice this problem to improve your DSA skill."}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="info">{q.topic}</Badge>
                    <Badge variant="warning">{q.difficulty}</Badge>
                    <Badge variant="purple">{q.platform}</Badge>
                  </div>
                </div>
                <Button variant="outline" className="gap-2"><Sparkles className="h-4 w-4" /> AI Help</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
