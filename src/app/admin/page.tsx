"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, Award, BookOpen, Briefcase, Bell, BarChart3,
  CheckCircle, Sparkles, LogOut, TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    stats: { totalStudents: number; activeStudents: number; pendingCerts: number; totalCourses: number; upcomingDrives: number };
    students: { id: string; name: string; college?: string; department?: string; xp: number; codingStreak: number; user: { email: string; isActive: boolean } }[];
    pendingCerts: { id: string; name: string; organization: string; student: { name: string } }[];
    deptStats: Record<string, { count: number; totalXp: number }>;
    drives: { id: string; company: string; role: string; deadline: string; package?: string }[];
  } | null>(null);
  const [notifForm, setNotifForm] = useState({ title: "", message: "" });
  const [tab, setTab] = useState("overview");

  function load() {
    fetch("/api/admin/dashboard").then((r) => r.json()).then(setData);
  }
  useEffect(() => { load(); }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function approveCert(id: string) {
    await fetch("/api/admin/actions", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve-cert", id }),
    });
    load();
  }

  async function sendNotification() {
    await fetch("/api/admin/actions", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send-notification", data: notifForm }),
    });
    setNotifForm({ title: "", message: "" });
    alert("Notifications sent!");
  }

  if (!data) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>;

  const deptChart = Object.entries(data.deptStats).map(([name, s]) => ({ name, students: s.count, avgXp: Math.round(s.totalXp / s.count) }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">Skill<span className="text-indigo-600">Forge</span> Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-indigo-600">Student View</Link>
            <button onClick={logout} className="flex items-center gap-1 text-sm text-red-600"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex gap-2 flex-wrap">
          {["overview", "students", "certs", "notifications"].map((t) => (
            <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        {tab === "overview" && (
          <>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
              {[
                { icon: Users, label: "Total Students", value: data.stats.totalStudents, color: "text-indigo-600" },
                { icon: TrendingUp, label: "Active", value: data.stats.activeStudents, color: "text-emerald-600" },
                { icon: Award, label: "Pending Certs", value: data.stats.pendingCerts, color: "text-amber-600" },
                { icon: BookOpen, label: "Courses", value: data.stats.totalCourses, color: "text-purple-600" },
                { icon: Briefcase, label: "Upcoming Drives", value: data.stats.upcomingDrives, color: "text-cyan-600" },
              ].map((s) => (
                <Card key={s.label} className="flex items-center gap-3">
                  <s.icon className={`h-8 w-8 ${s.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Department Comparison</CardTitle></CardHeader>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deptChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <CardHeader><CardTitle>Placement Drives</CardTitle></CardHeader>
                <div className="space-y-3">
                  {data.drives.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{d.company}</p>
                        <p className="text-xs text-slate-500">{d.role} • {d.package}</p>
                      </div>
                      <Badge variant="info">{new Date(d.deadline).toLocaleDateString()}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        {tab === "students" && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">College</th>
                    <th className="text-center py-3 px-4">XP</th>
                    <th className="text-center py-3 px-4">Streak</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{s.name}</td>
                      <td className="py-3 px-4 text-slate-500">{s.user.email}</td>
                      <td className="py-3 px-4">{s.college}</td>
                      <td className="text-center py-3 px-4">{s.xp}</td>
                      <td className="text-center py-3 px-4">{s.codingStreak}</td>
                      <td className="text-center py-3 px-4">
                        <Badge variant={s.user.isActive ? "success" : "danger"}>{s.user.isActive ? "Active" : "Inactive"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "certs" && (
          <div className="space-y-3">
            {data.pendingCerts.map((c) => (
              <Card key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-slate-500">{c.organization} • {c.student.name}</p>
                </div>
                <Button size="sm" onClick={() => approveCert(c.id)}><CheckCircle className="h-4 w-4" /> Approve</Button>
              </Card>
            ))}
            {data.pendingCerts.length === 0 && <Card className="text-center py-8"><p className="text-slate-500">No pending certifications</p></Card>}
          </div>
        )}

        {tab === "notifications" && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Send Notification</CardTitle></CardHeader>
            <div className="space-y-4 max-w-lg">
              <Input label="Title" value={notifForm.title} onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                <textarea className="w-full rounded-xl border border-slate-200 p-3 text-sm min-h-[100px]"
                  value={notifForm.message} onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })} />
              </div>
              <Button onClick={sendNotification}>Send to All Students</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
