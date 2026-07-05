"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { BADGE_DEFINITIONS, ACHIEVEMENT_DEFINITIONS } from "@/lib/constants";
import { Award, Star, Trophy, Lock } from "lucide-react";

interface EarnedAchievement {
  id: string;
  name: string;
  earnedAt: string;
}

export default function AchievementsPage() {
  const [earned, setEarned] = useState<EarnedAchievement[]>([]);
  const [stats, setStats] = useState({ totalXp: 0, totalCoins: 0, achievementCount: 0, badgeCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/achievements")
      .then((r) => r.json())
      .then((d) => {
        setEarned(d.achievements || []);
        setStats(d.stats || { totalXp: 0, totalCoins: 0, achievementCount: 0, badgeCount: 0 });
        setLoading(false);
      });
  }, []);

  const earnedNames = new Set(earned.map((a) => a.name));

  if (loading) return <DashboardLayout><div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Award className="h-7 w-7 text-amber-500" /> Achievements & Badges</h1>
          <p className="text-slate-500 text-sm mt-1">Earn XP, coins, and badges as you progress</p>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="text-center py-4"><p className="text-2xl font-bold text-indigo-600">{stats.totalXp}</p><p className="text-xs text-slate-500">Total XP</p></Card>
          <Card className="text-center py-4"><p className="text-2xl font-bold text-amber-600">{stats.totalCoins}</p><p className="text-xs text-slate-500">Coins</p></Card>
          <Card className="text-center py-4"><p className="text-2xl font-bold text-emerald-600">{stats.achievementCount}</p><p className="text-xs text-slate-500">Achievements</p></Card>
          <Card className="text-center py-4"><p className="text-2xl font-bold text-purple-600">{stats.badgeCount}</p><p className="text-xs text-slate-500">Badges</p></Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" /> Badges</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BADGE_DEFINITIONS.map((b) => {
              const unlocked = earnedNames.has(b.name);
              return (
                <Card key={b.name} hover className={`text-center py-6 ${unlocked ? "" : "opacity-50 grayscale"}`}>
                  <span className="text-4xl">{b.icon}</span>
                  <h3 className="font-semibold text-slate-900 mt-3">{b.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{b.description}</p>
                  {!unlocked && <div className="mt-2"><Lock className="h-4 w-4 text-slate-400 mx-auto" /></div>}
                  {unlocked && <Badge variant="success" className="mt-2">Unlocked</Badge>}
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2"><Trophy className="h-5 w-5 text-indigo-500" /> Achievements</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ACHIEVEMENT_DEFINITIONS.map((a) => {
              const unlocked = earnedNames.has(a.name);
              return (
                <Card key={a.name} hover className={unlocked ? "" : "opacity-50 grayscale"}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{a.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{a.name}</h3>
                      <p className="text-xs text-slate-500">{a.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="info">+{a.xpReward} XP</Badge>
                        <Badge variant="warning">+{a.coinReward} Coins</Badge>
                      </div>
                    </div>
                    {unlocked ? <Badge variant="success">Earned</Badge> : <Lock className="h-4 w-4 text-slate-400" />}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
