"use client";

import { motion } from "framer-motion";
import { Trophy, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Problem {
  topic: string;
  difficulty: string;
  solvedAt: string;
  aiScore?: number | null;
}

interface AchievementsProps {
  problems: Problem[];
  currentStreak: number;
  longestStreak: number;
}

interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorClass: string;
  bgGradient: string;
  checkUnlocked: (problems: Problem[], streak: number, maxStreak: number) => { unlocked: boolean; progress: number; target: number };
}

const BADGES: BadgeDef[] = [
  {
    id: "first_problem",
    name: "First Problem",
    description: "Solve your very first DSA problem",
    icon: "🚀",
    colorClass: "from-blue-500 to-cyan-500",
    bgGradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-900/40",
    checkUnlocked: (probs) => ({
      unlocked: probs.length >= 1,
      progress: Math.min(probs.length, 1),
      target: 1,
    }),
  },
  {
    id: "easy_10",
    name: "10 Easy Problems",
    description: "Solve 10 easy difficulty problems",
    icon: "🟢",
    colorClass: "from-emerald-400 to-teal-500",
    bgGradient: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-900/40",
    checkUnlocked: (probs) => {
      const count = probs.filter((p) => p.difficulty === "EASY").length;
      return { unlocked: count >= 10, progress: count, target: 10 };
    },
  },
  {
    id: "total_25",
    name: "25 Problems",
    description: "Solve 25 DSA problems in total",
    icon: "🥉",
    colorClass: "from-orange-400 to-amber-500",
    bgGradient: "bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-900/40",
    checkUnlocked: (probs) => ({
      unlocked: probs.length >= 25,
      progress: probs.length,
      target: 25,
    }),
  },
  {
    id: "total_50",
    name: "50 Problems",
    description: "Solve 50 DSA problems in total",
    icon: "🥈",
    colorClass: "from-slate-400 to-slate-500",
    bgGradient: "bg-gradient-to-br from-slate-500/10 to-slate-500/10 border-slate-200 dark:border-slate-800/40",
    checkUnlocked: (probs) => ({
      unlocked: probs.length >= 50,
      progress: probs.length,
      target: 50,
    }),
  },
  {
    id: "total_100",
    name: "100 Problems",
    description: "Solve 100 DSA problems in total",
    icon: "🥇",
    colorClass: "from-yellow-400 to-amber-600",
    bgGradient: "bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-200 dark:border-yellow-900/40",
    checkUnlocked: (probs) => ({
      unlocked: probs.length >= 100,
      progress: probs.length,
      target: 100,
    }),
  },
  {
    id: "streak_7",
    name: "7 Day Streak",
    description: "Maintain a 7-day daily solving streak",
    icon: "🔥",
    colorClass: "from-red-500 to-orange-500",
    bgGradient: "bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-200 dark:border-red-900/40",
    checkUnlocked: (_, __, maxStreak) => ({
      unlocked: maxStreak >= 7,
      progress: maxStreak,
      target: 7,
    }),
  },
  {
    id: "streak_30",
    name: "30 Day Streak",
    description: "Maintain a 30-day daily solving streak",
    icon: "👑",
    colorClass: "from-purple-500 to-pink-500",
    bgGradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-900/40",
    checkUnlocked: (_, __, maxStreak) => ({
      unlocked: maxStreak >= 30,
      progress: maxStreak,
      target: 30,
    }),
  },
  {
    id: "array_master",
    name: "Array Master",
    description: "Solve 15 Array & String problems",
    icon: "📊",
    colorClass: "from-indigo-500 to-blue-500",
    bgGradient: "bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-200 dark:border-indigo-900/40",
    checkUnlocked: (probs) => {
      const count = probs.filter((p) => {
        const t = p.topic.toLowerCase();
        return t.includes("array") || t.includes("string");
      }).length;
      return { unlocked: count >= 15, progress: count, target: 15 };
    },
  },
  {
    id: "hashmap_master",
    name: "HashMap Master",
    description: "Solve 10 HashMap & Hashing problems",
    icon: "🔑",
    colorClass: "from-teal-500 to-emerald-500",
    bgGradient: "bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-200 dark:border-teal-900/40",
    checkUnlocked: (probs) => {
      const count = probs.filter((p) => p.topic.toLowerCase().includes("hash")).length;
      return { unlocked: count >= 10, progress: count, target: 10 };
    },
  },
  {
    id: "tree_master",
    name: "Tree Master",
    description: "Solve 12 Tree & BST problems",
    icon: "🌳",
    colorClass: "from-green-500 to-emerald-600",
    bgGradient: "bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-200 dark:border-green-900/40",
    checkUnlocked: (probs) => {
      const count = probs.filter((p) => {
        const t = p.topic.toLowerCase();
        return t.includes("tree") || t.includes("bst");
      }).length;
      return { unlocked: count >= 12, progress: count, target: 12 };
    },
  },
  {
    id: "graph_explorer",
    name: "Graph Explorer",
    description: "Solve 10 Graph problems",
    icon: "🕸️",
    colorClass: "from-pink-500 to-rose-500",
    bgGradient: "bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-200 dark:border-pink-900/40",
    checkUnlocked: (probs) => {
      const count = probs.filter((p) => p.topic.toLowerCase().includes("graph")).length;
      return { unlocked: count >= 10, progress: count, target: 10 };
    },
  },
  {
    id: "dp_hero",
    name: "DP Hero",
    description: "Solve 15 Dynamic Programming problems",
    icon: "🧠",
    colorClass: "from-violet-500 to-fuchsia-500",
    bgGradient: "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-200 dark:border-violet-900/40",
    checkUnlocked: (probs) => {
      const count = probs.filter((p) => {
        const t = p.topic.toLowerCase();
        return t.includes("dynamic") || t.includes("dp");
      }).length;
      return { unlocked: count >= 15, progress: count, target: 15 };
    },
  },
  {
    id: "interview_ready",
    name: "Interview Ready",
    description: "Solve 35+ problems with average AI score >= 75",
    icon: "💼",
    colorClass: "from-indigo-600 to-violet-600",
    bgGradient: "bg-gradient-to-br from-indigo-600/10 to-violet-600/10 border-indigo-300 dark:border-indigo-900/40",
    checkUnlocked: (probs) => {
      const count = probs.length;
      const analyzed = probs.filter((p) => p.aiScore !== null && p.aiScore !== undefined);
      const totalScore = analyzed.reduce((sum, p) => sum + (p.aiScore || 0), 0);
      const avgScore = analyzed.length > 0 ? Math.round(totalScore / analyzed.length) : 0;
      
      const unlocked = count >= 35 && avgScore >= 75;
      
      return { 
        unlocked, 
        progress: count >= 35 ? (avgScore >= 75 ? 35 : 30) : count, 
        target: 35 
      };
    },
  },
];

export default function Achievements({ problems, currentStreak, longestStreak }: AchievementsProps) {
  // Sort badges so unlocked ones are shown first
  const processedBadges = BADGES.map((badge) => {
    const { unlocked, progress, target } = badge.checkUnlocked(problems, currentStreak, longestStreak);
    return { ...badge, unlocked, progress, target };
  }).sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1));

  const totalUnlocked = processedBadges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" /> Coding Achievements
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Solve problems to unlock premium ranks and badges.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 px-3.5 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/50">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
            {totalUnlocked} / {BADGES.length} Unlocked
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {processedBadges.map((badge) => {
          const percent = Math.min(Math.round((badge.progress / badge.target) * 100), 100);

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                className={`h-full border p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between ${badge.unlocked ? `${badge.bgGradient} shadow-md shadow-indigo-500/2 hover:shadow-xl` : "bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/80"}`}
              >
                {/* Glow effect for unlocked */}
                {badge.unlocked && (
                  <div className={`absolute -right-12 -top-12 h-24 w-24 rounded-full bg-gradient-to-br ${badge.colorClass} opacity-10 blur-xl`} />
                )}

                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* Badge Icon */}
                  <div className={`text-3xl p-2.5 rounded-2xl bg-white dark:bg-slate-850 shadow-sm border border-slate-100 dark:border-slate-800 ${badge.unlocked ? "animate-pulse" : "opacity-40"}`}>
                    {badge.icon}
                  </div>

                  {badge.unlocked ? (
                    <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-150 shrink-0">
                      <CheckCircle2 className="h-3 w-3 mr-0.5" /> Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shrink-0">
                      <Lock className="h-2.5 w-2.5 mr-0.5" /> Locked
                    </span>
                  )}
                </div>

                <div className="flex-1 mb-4">
                  <h4 className={`font-bold text-sm leading-snug ${badge.unlocked ? "text-slate-800 dark:text-slate-100" : "text-slate-450 dark:text-slate-500"}`}>
                    {badge.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-1">
                    {badge.description}
                  </p>
                </div>

                {/* Progress bar for locked/unlocked badges */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                    <span>Progress</span>
                    <span className="font-mono">{badge.progress} / {badge.target}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full bg-gradient-to-r ${badge.unlocked ? badge.colorClass : "from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600"}`}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
