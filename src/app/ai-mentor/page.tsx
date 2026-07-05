"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress";
import { Sparkles, Brain, Calendar, HelpCircle, AlertTriangle, MessageSquare } from "lucide-react";

export default function AiMentorPage() {
  const [suggestions, setSuggestions] = useState<{ title: string; content: string; priority: string; type: string }[]>([]);
  const [plan, setPlan] = useState<Record<string, { focus: string; task: string; duration: string }>>({});
  const [weakAreas, setWeakAreas] = useState<{ area: string; score: number; advice: string }[]>([]);
  const [prediction, setPrediction] = useState<{ overall: number; status: string; explanation: string[] } | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [qType, setQType] = useState("technical");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
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

  async function sendChatMessage() {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      if (response.ok && data.reply) {
        setChatMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "assistant", text: data.error || "Sorry, I could not respond." }]);
      }
    } catch (error) {
      setChatMessages((prev) => [...prev, { role: "assistant", text: "Failed to reach the AI service." }]);
    } finally {
      setChatLoading(false);
    }
  }

  if (loading) return <DashboardLayout><div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Sparkles className="h-7 w-7 text-indigo-600" /> AI Career Mentor</h1>
          <p className="text-slate-500 mt-1">Your personal AI-powered placement coach</p>
        </div>

        {prediction && (
          <Card className="gradient-bg text-white border-0">
            <div className="flex items-center gap-8">
              <ProgressRing value={prediction.overall} size={120} color="#ffffff" />
              <div>
                <h2 className="text-xl font-bold">Placement Prediction</h2>
                <Badge className="mt-2 bg-white/20 text-white border-0">{prediction.status.replace(/_/g, " ")}</Badge>
                <ul className="mt-3 space-y-1">
                  {prediction.explanation.slice(0, 2).map((e, i) => (
                    <li key={i} className="text-sm text-indigo-100">• {e}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> AI Suggestions</CardTitle></CardHeader>
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={s.priority === "high" ? "danger" : "info"}>{s.priority}</Badge>
                    <span className="font-medium text-sm">{s.title}</span>
                  </div>
                  <p className="text-xs text-slate-600">{s.content}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Weekly Study Plan</CardTitle></CardHeader>
            <div className="space-y-2">
              {Object.entries(plan).map(([day, item]) => (
                <div key={day} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <span className="text-xs font-bold text-indigo-600 uppercase w-12">{day.slice(0, 3)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.focus}</p>
                    <p className="text-xs text-slate-500">{item.task}</p>
                  </div>
                  <span className="text-xs text-slate-400">{item.duration}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Weak Areas Analysis</CardTitle></CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {weakAreas.map((w) => (
              <div key={w.area} className="p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-slate-900">{w.area}</span>
                  <span className="text-sm font-bold text-red-500">{w.score}%</span>
                </div>
                <p className="text-xs text-slate-600">{w.advice}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" /> Interview Question Generator</CardTitle></CardHeader>
          <div className="flex flex-wrap gap-2 mb-4">
            {["technical", "hr", "sql", "java", "coding"].map((t) => (
              <Button key={t} variant={qType === t ? "default" : "outline"} size="sm" onClick={() => loadQuestions(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-50 text-sm text-slate-700">
                <span className="font-medium text-indigo-600">Q{i + 1}.</span> {q}
              </div>
            ))}
            {questions.length === 0 && (
              <p className="text-sm text-slate-500">Click a category above to generate interview questions.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> AI Chat Assistant</CardTitle></CardHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
              {chatMessages.length === 0 ? (
                <p className="text-sm text-slate-500">Ask the AI mentor a question about resume tips, interview prep, or skills growth.</p>
              ) : 
(
  chatMessages.map((message, index) => (
    <div
      key={index}
      className={
        message.role === "user"
          ? "self-end rounded-2xl bg-indigo-600 px-4 py-3 text-sm text-white"
          : "self-start rounded-2xl bg-white px-4 py-3 text-sm text-slate-800 whitespace-pre-wrap break-words"
      }
    >
      {message.role === "assistant" ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.text}
        </ReactMarkdown>
      ) : (
        message.text
      )}
    </div>
  ))              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask the AI mentor..."
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    sendChatMessage();
                  }
                }}
              />
              <Button variant="default" size="md" onClick={sendChatMessage} disabled={chatLoading}>
                {chatLoading ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
