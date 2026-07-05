import Link from "next/link";
import { ArrowRight, Play, Star, Users, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
              <Star className="h-4 w-4 fill-indigo-500 text-indigo-500" />
              Trusted by 500+ colleges worldwide
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Master Placements with{" "}
              <span className="gradient-text">AI-Powered</span> Career Intelligence
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              SkillForge tracks your skills, projects, DSA practice, aptitude scores, and interview performance —
              then uses AI to predict your placement readiness and guide your career journey.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register">
                <Button size="lg" className="animate-pulse-glow">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                <Play className="h-4 w-4" /> Watch Demo
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">50K+</p>
                  <p className="text-xs text-slate-500">Active Students</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">92%</p>
                  <p className="text-xs text-slate-500">Placement Rate</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">4.9</p>
                  <p className="text-xs text-slate-500">User Rating</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-float hidden lg:block">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-indigo-500/10">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Placement Readiness</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Ready</span>
              </div>
              <div className="flex items-center justify-center py-6">
                <div className="relative h-40 w-40">
                  <svg className="-rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#6366f1" strokeWidth="12"
                      strokeDasharray="440" strokeDashoffset="88" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-900">82%</span>
                    <span className="text-xs text-slate-500">Overall Score</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "DSA", score: 78, color: "bg-indigo-500" },
                  { label: "Projects", score: 85, color: "bg-emerald-500" },
                  { label: "Resume", score: 72, color: "bg-amber-500" },
                  { label: "Aptitude", score: 90, color: "bg-cyan-500" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 p-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-semibold">{item.score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
