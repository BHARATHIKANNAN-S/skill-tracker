"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProgressRing, ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Target, Code2, FileText, MessageSquare, Award,
  FolderKanban, Flame, Trophy, Bell, Sparkles, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

interface DashboardData {
  profile: { name: string; xp: number; coins: number; level: number; codingStreak: number; department?: string; college?: string };
  scores: {
    overall: number; profileCompletion: number; resume: number; technical: number;
    communication: number; coding: number; aptitude: number; projects: number;
    status: string; explanation: string[];
  };
  suggestions: { title: string; content: string; priority: string }[];
  rank: number;
  totalStudents: number;
  weeklyDsa: number;
  monthlyDsa: number;
  notifications: { title: string; message: string; createdAt: string }[];
  stats: { totalDsa: number; totalProjects: number; totalCerts: number; totalInterviews: number };
  error?: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((r) => r.json())
      .then((res) => {
        if (res && res.error) {
          const errorMsg = res.error.toLowerCase();
          if (errorMsg.includes("unauthorized") || errorMsg.includes("session") || errorMsg.includes("format")) {
            // Clear invalid session cookie and redirect to login
            fetch("/api/auth/logout", { method: "POST" }).finally(() => {
              window.location.href = "/login";
            });
            return;
          }
        }
        setData(res);
      })
      .catch((err) => {
        console.error("Dashboard data load error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  // Handle unauthorized or loading errors safely
  if (!data || data.error) {
    const errorMsg = data?.error || "Failed to load dashboard data.";
    const isAuthError = errorMsg.toLowerCase().includes("unauthorized") || errorMsg.toLowerCase().includes("session");
    
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
          <Trophy className="h-10 w-10 text-slate-350" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100">Session Redirect</h3>
            <p className="text-xs text-slate-500 max-w-sm">{errorMsg}</p>
          </div>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 border-0 cursor-pointer"
            onClick={() => window.location.href = isAuthError ? "/login" : "/"}
          >
            {isAuthError ? "Go to Login" : "Go Home"}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, scores, suggestions, rank, notifications, stats } = data;

  const radarData = [
    { subject: "Technical", value: scores.technical ?? 0 },
    { subject: "Coding", value: scores.coding ?? 0 },
    { subject: "Resume", value: scores.resume ?? 0 },
    { subject: "Aptitude", value: scores.aptitude ?? 0 },
    { subject: "Projects", value: scores.projects ?? 0 },
    { subject: "Communication", value: scores.communication ?? 0 },
  ];

  const weeklyData = [
    { day: "Mon", problems: Math.max(0, data.weeklyDsa - 4) },
    { day: "Tue", problems: Math.max(0, data.weeklyDsa - 2) },
    { day: "Wed", problems: Math.max(1, data.weeklyDsa - 1) },
    { day: "Thu", problems: data.weeklyDsa },
    { day: "Fri", problems: Math.max(0, data.weeklyDsa - 3) },
    { day: "Sat", problems: Math.max(0, data.weeklyDsa - 1) },
    { day: "Sun", problems: Math.max(0, data.weeklyDsa - 2) },
  ];

  // Map to the badge component's defined variants: success, warning, danger
  const statusColor = scores.status === "READY" ? "success" : scores.status === "ALMOST_READY" ? "warning" : "danger";
  const statusLabel = scores.status === "READY" ? "Ready" : scores.status === "ALMOST_READY" ? "Almost Ready" : "Needs Improvement";

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile.name}! 👋</h1>
          <p className="text-slate-500 mt-1">{profile.college} • {profile.department}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 flex flex-col items-center justify-center gradient-bg text-white border-0 py-6">
            <p className="text-sm font-medium text-indigo-100 mb-2">Placement Readiness</p>
            <ProgressRing value={scores.overall ?? 0} size={140} strokeWidth={10} color="#ffffff" />
            <Badge variant={statusColor as "success" | "warning" | "danger"} className="mt-4 bg-white/20 text-white border-0">
              {statusLabel}
            </Badge>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
              <CardDescription>Your placement readiness across all dimensions</CardDescription>
            </CardHeader>
            <div className="grid gap-4 sm:grid-cols-2 p-6 pt-0">
              <ProgressBar value={scores.profileCompletion ?? 0} label="Profile Completion" color="bg-indigo-500" />
              <ProgressBar value={scores.resume ?? 0} label="Resume Score" color="bg-emerald-500" />
              <ProgressBar value={scores.technical ?? 0} label="Technical Skills" color="bg-purple-500" />
              <ProgressBar value={scores.coding ?? 0} label="Coding / DSA" color="bg-cyan-500" />
              <ProgressBar value={scores.aptitude ?? 0} label="Aptitude" color="bg-amber-500" />
              <ProgressBar value={scores.communication ?? 0} label="Communication" color="bg-rose-500" />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Code2, label: "DSA Solved", value: stats.totalDsa ?? 0, color: "text-indigo-600 bg-indigo-100" },
            { icon: FolderKanban, label: "Projects", value: stats.totalProjects ?? 0, color: "text-emerald-600 bg-emerald-100" },
            { icon: Award, label: "Certifications", value: stats.totalCerts ?? 0, color: "text-amber-600 bg-amber-100" },
            { icon: MessageSquare, label: "Interviews", value: stats.totalInterviews ?? 0, color: "text-rose-600 bg-rose-100" },
          ].map((s) => (
            <Card key={s.label} className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4"><CardTitle>Skills Radar</CardTitle></CardHeader>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 pb-4"><CardTitle>Weekly DSA Progress</CardTitle></CardHeader>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="problems" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> Leaderboard</CardTitle>
            </CardHeader>
            <div className="text-center py-4">
              <p className="text-5xl font-bold gradient-text">#{rank}</p>
              <p className="text-sm text-slate-500 mt-1">out of {data.totalStudents} students</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <Flame className="h-4 w-4 text-orange-500" />
              {profile.codingStreak} day streak
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-500" /> AI Suggestions</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {suggestions && suggestions.length > 0 ? (
                suggestions.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <Badge variant={s.priority === "high" ? "danger" : "info"}>{s.priority}</Badge>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{s.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No suggestions yet.</p>
              )}
              <Link href="/ai-mentor" className="flex items-center gap-1 text-sm text-indigo-600 hover:underline pt-2 block">
                View all suggestions <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Placement Analysis</CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {scores.explanation && scores.explanation.length > 0 ? (
              scores.explanation.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <TrendingUp className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                  {e}
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-450 italic">Analysis complete. Keep practicing!</li>
            )}
          </ul>
        </Card>

        {notifications && notifications.length > 0 && (
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Recent Notifications</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {notifications.map((n, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 text-sm">
                  <p className="font-medium text-slate-900">{n.title}</p>
                  <p className="text-slate-500">{n.message}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
