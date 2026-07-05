"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { APTITUDE_CATEGORIES } from "@/lib/constants";
import { Plus, ExternalLink, BrainCircuit, Landmark, HelpCircle, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TestRecord {
  id: string;
  category: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  takenAt: string;
}

interface AptitudeData {
  tests: TestRecord[];
  stats: {
    avgScore: number;
    avgTime: number;
    weakAreas: { category: string; avgScore: number }[];
    total: number;
  };
}

const PRACTICE_PORTALS = [
  {
    name: "IndiaBIX",
    description: "The #1 portal for Quantitative Aptitude, Logical Reasoning, and Verbal Ability questions with step-by-step formulas and solutions.",
    category: "Quantitative & Logical",
    icon: Landmark,
    links: [
      { label: "Quantitative Aptitude", url: "https://www.indiabix.com/quantitative-aptitude/questions-and-answers/" },
      { label: "Logical Reasoning", url: "https://www.indiabix.com/logical-reasoning/questions-and-answers/" },
      { label: "Verbal Ability", url: "https://www.indiabix.com/verbal-ability/questions-and-answers/" }
    ],
    badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400"
  },
  {
    name: "GeeksforGeeks",
    description: "Structured placement aptitude section, math shortcuts, and famous logical coding puzzles commonly asked in tech interviews.",
    category: "Math & Puzzles",
    icon: BrainCircuit,
    links: [
      { label: "Aptitude Practice", url: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/" },
      { label: "Logical Puzzles", url: "https://www.geeksforgeeks.org/puzzles/" }
    ],
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
  },
  {
    name: "PrepInsta",
    description: "Company-specific aptitude patterns (TCS NQT, Accenture, Cognizant, Wipro, Zoho) with shortcut tips and tricks.",
    category: "Placement Specific",
    icon: Award,
    links: [
      { label: "Aptitude Topics", url: "https://prepinsta.com/aptitude/" },
      { label: "Company Papers", url: "https://prepinsta.com/syllabus/" }
    ],
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
  }
];

export default function AptitudePage() {
  const [data, setData] = useState<AptitudeData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Logical Reasoning", totalQuestions: 20, correctAnswers: 15, timeTaken: 30 });
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/student/aptitude")
      .then((r) => r.json())
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.error("Error loading aptitude data:", err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (form.totalQuestions <= 0 || form.correctAnswers < 0) return;
    const score = (form.correctAnswers / form.totalQuestions) * 100;
    try {
      const res = await fetch("/api/student/aptitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, score }),
      });
      if (res.ok) {
        setShowForm(false);
        load();
      }
    } catch (err) {
      console.error("Failed to log test:", err);
    }
  }

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  const chartData = (data.tests || []).slice(-10).map((t, i) => ({
    name: `#${i + 1}`,
    score: Math.round(t.score)
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-1">
        
        {/* Page Title & Log Trigger */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Aptitude Arena</h1>
            <p className="text-xs text-slate-500 mt-1">Track your logical progress and solve placement questions on top portals.</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="cursor-pointer gap-1.5 rounded-xl h-10 font-bold bg-indigo-600 hover:bg-indigo-700 border-0 text-white">
            <Plus className="h-4.5 w-4.5" /> Log Test Result
          </Button>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid gap-4 grid-cols-3">
          <Card className="text-center py-5 border-slate-200">
            <p className="text-2xl font-black text-indigo-650 dark:text-indigo-400">{Math.round(data.stats.avgScore ?? 0)}%</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Accuracy</p>
          </Card>
          <Card className="text-center py-5 border-slate-200">
            <p className="text-2xl font-black text-amber-500">{data.stats.avgTime ?? 0}m</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Time Spent</p>
          </Card>
          <Card className="text-center py-5 border-slate-200">
            <p className="text-2xl font-black text-emerald-500">{data.stats.total ?? 0}</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Tests logged</p>
          </Card>
        </div>

        {/* Form to Log Tests */}
        {showForm && (
          <Card className="p-6 border-indigo-250 bg-indigo-50/5">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-indigo-650 mb-4">Log Completed Aptitude Test</h4>
            <div className="grid gap-4 sm:grid-cols-4 items-end">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="bg-white dark:bg-slate-900 border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer h-10 w-full"
                >
                  {APTITUDE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Input 
                label="Total Questions" 
                type="number" 
                value={form.totalQuestions} 
                onChange={(e) => setForm({ ...form, totalQuestions: Number(e.target.value) })} 
              />
              <Input 
                label="Correct Answers" 
                type="number" 
                value={form.correctAnswers} 
                onChange={(e) => setForm({ ...form, correctAnswers: Number(e.target.value) })} 
              />
              <Input 
                label="Time Taken (minutes)" 
                type="number" 
                value={form.timeTaken} 
                onChange={(e) => setForm({ ...form, timeTaken: Number(e.target.value) })} 
              />
              <div className="sm:col-span-4">
                <Button onClick={add} className="w-full bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl h-10 font-bold border-0 cursor-pointer">
                  Save Result
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Aptitude portal links (IndiaBIX, GeeksforGeeks, PrepInsta) */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-450 uppercase tracking-wider">🔥 Practice Aptitude Portals</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {PRACTICE_PORTALS.map((portal) => {
              const Icon = portal.icon;
              return (
                <Card key={portal.name} className="p-5 flex flex-col justify-between border-slate-200 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{portal.name}</h4>
                      </div>
                      <Badge variant="default" className={`text-[9px] font-bold px-2 py-0.5 rounded-full border-0 ${portal.badgeColor}`}>
                        {portal.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{portal.description}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-2">
                    {portal.links.map((link) => (
                      <a 
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-[10px] font-bold rounded-lg border-slate-200 hover:bg-slate-50 gap-1 px-2.5 cursor-pointer bg-white"
                        >
                          {link.label} <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Charts & Analysis section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5 border-slate-200">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-extrabold">Aptitude Progress Graph</CardTitle>
            </CardHeader>
            <div className="pt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                  No tests logged yet. Log your first test result to view progress!
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5 border-slate-200">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-sm font-extrabold">Weak Areas Analysis</CardTitle>
            </CardHeader>
            <div className="space-y-4 pt-2">
              {data.stats.weakAreas && data.stats.weakAreas.length > 0 ? (
                data.stats.weakAreas.map((w) => (
                  <ProgressBar 
                    key={w.category} 
                    value={Math.round(w.avgScore)} 
                    label={w.category} 
                    color={w.avgScore < 60 ? "bg-red-500" : "bg-indigo-600"} 
                  />
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-10 text-center">
                  Take tests and save your results to identify weak categories.
                </p>
              )}
            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
