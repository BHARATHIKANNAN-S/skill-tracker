"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Medal } from "lucide-react";

interface Entry {
  rank: number; name: string; college?: string; overallScore: number;
  codingScore: number; projectScore: number; resumeScore: number;
  dsaCount: number; xp: number; codingStreak: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    fetch("/api/student/leaderboard").then((r) => r.json()).then((d) => setEntries(d.leaderboard || []));
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Trophy className="h-7 w-7 text-amber-500" /> Leaderboard</h1>
          <p className="text-slate-500 text-sm mt-1">Ranked by overall placement readiness score</p>
        </div>

        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.rank} className={`flex items-center gap-4 ${e.rank <= 3 ? "border-amber-200 bg-amber-50/30" : ""}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-lg">
                {e.rank <= 3 ? medals[e.rank - 1] : `#${e.rank}`}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{e.name}</p>
                <p className="text-xs text-slate-500">{e.college}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <span className="text-indigo-600 font-medium">{e.overallScore}%</span>
                <span className="text-slate-500">{e.dsaCount} DSA</span>
                <span className="flex items-center gap-1 text-orange-500"><Flame className="h-3 w-3" />{e.codingStreak}</span>
              </div>
              <Badge variant={e.rank <= 3 ? "warning" : "default"}>{e.xp} XP</Badge>
            </Card>
          ))}
        </div>
        {entries.length === 0 && <Card className="text-center py-12"><p className="text-slate-500">No leaderboard data yet.</p></Card>}
      </div>
    </DashboardLayout>
  );
}
