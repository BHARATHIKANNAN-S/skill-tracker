"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, User, Code2, FolderKanban, Award, Brain,
  FileText, MessageSquare, Target, Trophy, Sparkles, LogOut,
  Menu, X, Bell, Flame, Coins, BarChart3, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/skills", label: "Skills", icon: Brain },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/certifications", label: "Certifications", icon: Award },
  { href: "/dsa", label: "DSA Tracker", icon: Code2 },
  { href: "/aptitude", label: "Aptitude", icon: Target },
  { href: "/interviews", label: "Mock Interviews", icon: MessageSquare },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/ai-mentor", label: "AI Mentor", icon: Sparkles },
  { href: "/weekly-goals", label: "Weekly Goals", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/achievements", label: "Achievements", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children, user }: { children: React.ReactNode; user?: { name?: string; xp?: number; coins?: number; level?: number; codingStreak?: number } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-slate-200 transition-transform lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">Skill<span className="text-indigo-600">Forge</span></span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={cn("h-4 w-4", active && "text-indigo-600")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-amber-600"><Flame className="h-4 w-4" />{user.codingStreak || 0}</span>
                  <span className="flex items-center gap-1 text-indigo-600">Lv.{user.level || 1}</span>
                  <span className="flex items-center gap-1 text-emerald-600">{user.xp || 0} XP</span>
                  <span className="flex items-center gap-1 text-amber-500"><Coins className="h-4 w-4" />{user.coins || 0}</span>
                </div>
                <button className="relative p-2 rounded-lg hover:bg-slate-100"><Bell className="h-5 w-5 text-slate-600" /></button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-bg text-white text-sm font-bold">
                  {user.name?.charAt(0) || "S"}
                </div>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
