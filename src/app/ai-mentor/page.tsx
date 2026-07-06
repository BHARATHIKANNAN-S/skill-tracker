"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress";
import { Sparkles, Brain, Calendar, HelpCircle, AlertTriangle, MessageSquare, ArrowRight, BookOpen } from "lucide-react";

export default function AiMentorPage() {
  const [suggestions, setSuggestions] = useState<{ title: string; content: string; priority: string; type: string }[]>([]);
  const [plan, setPlan] = useState<Record<string, { focus: string; task: string; duration: string }>>({});
  const [weakAreas, setWeakAreas] = useState<{ area: string; score: number; advice: string }[]>([]);
  const [prediction, setPrediction] = useState<{ overall: number; status: string; explanation: string[] } | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [qType, setQType] = useState("technical");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/student/ai?action=suggestions").then((r) => r.json()),
      fetch("/api/student/ai?action=study-plan").then((r) => r.json()),
      fetch("/api/student/ai?action=weak-areas").then((r) => r.json()),
      fetch("/api/student/ai?action=placement").then((r) => r.json()),
    ]).then(([sug, pln, weak, pred]) => {
      setSuggestions(sug.suggestions || []);
      setPlan(pln.plan || {});
      setWeakAreas(weak.areas || []);
      setPrediction(pred.prediction || null);
      setLoading(false);
    });
  }, []);

  async function loadQuestions(type: string) {
    setQType(type);
    const res = await fetch(`/api/student/ai?action=questions&type=${type}`);
    const data = await res.json();
    setQuestions(data.questions || []);
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-indigo-600" /> AI Career Dashboard
            </h1>
            <p className="text-slate-500 mt-1">AI-powered insights, placement readiness analysis, and custom study plans</p>
          </div>
          <Button 
            onClick={() => window.dispatchEvent(new CustomEvent("open-ai-mentor"))}
            className="gradient-bg text-white shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold self-start"
          >
            <MessageSquare className="h-4.5 w-4.5" /> Chat with AI Mentor
          </Button>
        </div>

        {/* Prediction and AI Coach Welcome Card */}
        <div className="grid gap-6 md:grid-cols-3">
          {prediction && (
            <Card className="gradient-bg text-white border-0 md:col-span-2 overflow-hidden relative shadow-lg shadow-indigo-100">
              {/* Background accent glow */}
              <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
              
              <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                <div className="flex shrink-0 items-center justify-center p-2 bg-white/10 rounded-full border border-white/10">
                  <ProgressRing value={prediction.overall} size={110} color="#ffffff" strokeWidth={8} />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-lg font-bold">Placement Probability Score</h2>
                    <Badge className="bg-white/25 text-white border-0 hover:bg-white/30 text-xs px-2.5 py-0.5 font-semibold">
                      {prediction.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <ul className="space-y-1.5 text-xs text-indigo-50 font-medium">
                    {prediction.explanation.map((e, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-300 mt-0.5">•</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          <Card className="border-0 bg-indigo-50/40 border border-indigo-100/50 flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100/70 text-indigo-700 mb-3">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Need 1-on-1 Guidance?</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Click the button below to ask about coding tips, resume reviews, placement guidelines, or custom study questions.
              </p>
            </div>
            <Button 
              onClick={() => window.dispatchEvent(new CustomEvent("open-ai-mentor"))}
              variant="outline" 
              size="sm" 
              className="mt-4 border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all w-full flex items-center justify-center gap-1.5 font-medium"
            >
              Open Side Mentor <ArrowRight className="h-3.5 w-3.5 animate-pulse" />
            </Button>
          </Card>
        </div>

        {/* Suggestions & Study Plan Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* AI Suggestions Card */}
          <Card hover>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                <Brain className="h-5 w-5 text-indigo-600" /> AI Suggestions
              </CardTitle>
              <Badge variant="info" className="text-[10px] font-bold uppercase">{suggestions.length} Tips</Badge>
            </CardHeader>
            <CardContent className="mt-4 space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {suggestions.map((s, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100/80 hover:border-indigo-100 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant={s.priority === "high" ? "danger" : "info"} className="text-[10px] uppercase font-bold py-0.5 px-2">
                      {s.priority}
                    </Badge>
                    <span className="font-semibold text-slate-800 text-xs">{s.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">{s.content}</p>
                </div>
              ))}
              {suggestions.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No suggestions generated yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Weekly Study Plan */}
          <Card hover>
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                <Calendar className="h-5 w-5 text-indigo-600" /> Weekly Study Plan
              </CardTitle>
              <Badge variant="info" className="text-[10px] font-bold uppercase">Active Plan</Badge>
            </CardHeader>
            <CardContent className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {Object.entries(plan).map(([day, item]) => (
                <div key={day} className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5 uppercase w-14 text-center tracking-wider shrink-0">
                    {day.slice(0, 3)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.focus}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.task}</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">{item.duration}</span>
                </div>
              ))}
              {Object.keys(plan).length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No study plan available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weak Areas Analysis */}
        <Card hover>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Weak Areas Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4 grid gap-4 sm:grid-cols-2">
            {weakAreas.map((w) => (
              <div key={w.area} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-amber-200 transition-all">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="font-semibold text-slate-800 text-xs">{w.area}</span>
                  <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                    {w.score}% Score
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">{w.advice}</p>
              </div>
            ))}
            {weakAreas.length === 0 && (
              <div className="sm:col-span-2 text-center py-6 text-xs text-slate-500">
                Excellent! No critical weak areas detected.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interview Question Generator */}
        <Card hover>
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
              <HelpCircle className="h-5 w-5 text-indigo-600" /> Interview Question Generator
            </CardTitle>
            <div className="flex flex-wrap gap-1.5">
              {["technical", "hr", "sql", "java", "coding"].map((t) => (
                <Button 
                  key={t} 
                  variant={qType === t ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => loadQuestions(t)}
                  className="text-[10px] font-semibold py-1 h-7 px-3 rounded-lg"
                >
                  {t.toUpperCase()}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="mt-4 space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100/80 text-xs text-slate-700 flex items-start gap-2.5 hover:border-indigo-100 transition-colors">
                <span className="font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 text-[10px]">
                  Q{i + 1}
                </span>
                <span className="leading-relaxed">{q}</span>
              </div>
            ))}
            {questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 space-y-2">
                <BookOpen className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-medium text-slate-500">Select a category tab above to generate target interview questions.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
