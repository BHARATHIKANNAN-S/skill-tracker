"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  Code, 
  BookOpen, 
  Tag, 
  Cpu, 
  Award, 
  AlertCircle, 
  ChevronDown, 
  Sparkles 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Suggestion {
  title: string;
  explanation: string;
}

export interface AiReviewData {
  score: number;
  timeComplexity: string;
  spaceComplexity: string;
  optimal: boolean;
  codeQuality: string;
  readability: string;
  naming: string;
  memoryUsage: string;
  readiness: string;
  edgeCases: string;
  suggestions: Suggestion[] | string; // Suggestion objects or JSON string
}

interface AiReviewCardProps {
  data: AiReviewData;
  isLoading?: boolean;
}

export default function AiReviewCard({ data, isLoading = false }: AiReviewCardProps) {
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Card className="p-6 border border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-500 animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">AI Analysis in Progress</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px]">Evaluating time complexity, edge cases, naming conventions, and optimal structures...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Parse suggestions if stringified JSON
  let suggestionsList: Suggestion[] = [];
  try {
    if (typeof data.suggestions === "string") {
      suggestionsList = JSON.parse(data.suggestions);
    } else if (Array.isArray(data.suggestions)) {
      suggestionsList = data.suggestions;
    }
  } catch {
    suggestionsList = [];
  }

  // Fallback if suggestions parsing failed or is empty but we have raw text
  if (suggestionsList.length === 0 && typeof data.suggestions === "string" && data.suggestions) {
    suggestionsList = [
      {
        title: "Code Recommendation",
        explanation: data.suggestions
      }
    ];
  }

  const scoreColor = data.score >= 80 
    ? "text-emerald-500 stroke-emerald-500" 
    : data.score >= 50 
      ? "text-amber-500 stroke-amber-500" 
      : "text-red-500 stroke-red-500";

  const scoreBgColor = data.score >= 80 
    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200" 
    : data.score >= 50 
      ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200" 
      : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200";

  // Calculate circular stroke offset
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.score / 100) * circumference;

  const metrics = [
    { label: "Code Quality", value: data.codeQuality, icon: Code, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
    { label: "Readability", value: data.readability, icon: BookOpen, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40" },
    { label: "Naming Convention", value: data.naming, icon: Tag, color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40" },
    { label: "Memory Efficiency", value: data.memoryUsage, icon: Cpu, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/40" },
    { label: "Interview Readiness", value: data.readiness, icon: Award, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/40" },
  ];

  return (
    <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">AI Review Report</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-center border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
        {/* Score Dial */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative h-24 w-24">
            <svg className="h-full w-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                strokeWidth="8"
              />
              <motion.circle
                cx="48"
                cy="48"
                r={radius}
                className={`fill-none transition-all duration-1000 ${scoreColor}`}
                strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{data.score}</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Score</span>
            </div>
          </div>
          <Badge className={`mt-2 font-semibold capitalize border ${scoreBgColor}`} variant="default">
            {data.score >= 80 ? "Excellent" : data.score >= 50 ? "Acceptable" : "Needs Work"}
          </Badge>
        </div>

        {/* Complexity Stats */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Time Complexity</span>
            <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {data.timeComplexity || "O(?)"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Space Complexity</span>
            <span className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
              {data.spaceComplexity || "O(?)"}
            </span>
          </div>

          <div className="col-span-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400">Optimal Solution Checker</span>
            {data.optimal ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Optimal
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1 rounded-full border border-rose-200">
                <XCircle className="h-3.5 w-3.5" /> Sub-optimal
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Detail Metrics Grid */}
      <div className="space-y-4 mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Code Quality Metrics</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 rounded-xl">
                <div className={`p-2 rounded-lg ${m.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block leading-tight">{m.label}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-normal">{m.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edge Cases Card */}
      {data.edgeCases && (
        <div className="mb-6 p-4 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <h4 className="text-sm font-semibold">Edge Cases & Corner Inputs</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
            {data.edgeCases}
          </p>
        </div>
      )}

      {/* Recommendations / Suggestions */}
      {suggestionsList.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Code Enhancements</h4>
          <div className="grid gap-2">
            {suggestionsList.map((suggestion, idx) => (
              <div 
                key={idx}
                className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/20 dark:bg-slate-900/20 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                <button
                  onClick={() => setExpandedSuggestion(expandedSuggestion === idx ? null : idx)}
                  className="flex items-center justify-between w-full p-4 text-left font-medium text-slate-800 dark:text-slate-200 text-sm hover:bg-slate-50 dark:hover:bg-slate-850/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span>{suggestion.title}</span>
                  </div>
                  <ChevronDown 
                    className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${expandedSuggestion === idx ? "rotate-180" : ""}`} 
                  />
                </button>

                <AnimatePresence>
                  {expandedSuggestion === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden bg-white dark:bg-slate-900/40"
                    >
                      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-550 dark:text-slate-300 leading-relaxed font-normal">
                        {suggestion.explanation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
