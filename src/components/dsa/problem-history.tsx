"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Calendar, 
  Clock, 
  BrainCircuit,
  RefreshCcw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DSA_PLATFORMS, DSA_TOPICS } from "@/lib/constants";

interface Problem {
  id: string;
  title: string;
  platform: string;
  topic: string;
  difficulty: string;
  solvedAt: string;
  timeTaken?: number | null;
  url?: string | null;
  aiScore?: number | null;
  revisionStep: number;
}

interface ProblemHistoryProps {
  problems: Problem[];
  onProblemClick: (problem: Problem) => void;
}

const ITEMS_PER_PAGE = 8;

export default function ProblemHistory({ problems, onProblemClick }: ProblemHistoryProps) {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [topicFilter, setTopicFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  const handleFilterChange = (setter: (val: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  const filteredProblems = useMemo(() => {
    return problems
      .filter((p) => {
        // Search term
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());

        // Platform
        const matchesPlatform = platformFilter === "ALL" || p.platform === platformFilter;

        // Difficulty
        const matchesDifficulty = difficultyFilter === "ALL" || p.difficulty === difficultyFilter;

        // Topic
        const matchesTopic = topicFilter === "ALL" || p.topic === topicFilter;

        // Date Solved
        let matchesDate = true;
        if (dateFilter !== "ALL") {
          const solvedDate = new Date(p.solvedAt);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - solvedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (dateFilter === "TODAY") {
            matchesDate = diffDays <= 1;
          } else if (dateFilter === "WEEK") {
            matchesDate = diffDays <= 7;
          } else if (dateFilter === "MONTH") {
            matchesDate = diffDays <= 30;
          }
        }

        return matchesSearch && matchesPlatform && matchesDifficulty && matchesTopic && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime();
        }
        if (sortBy === "OLDEST") {
          return new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime();
        }
        if (sortBy === "FASTEST") {
          return (a.timeTaken || 999) - (b.timeTaken || 999);
        }
        if (sortBy === "SCORE_HIGH") {
          return (b.aiScore || 0) - (a.aiScore || 0);
        }
        return 0;
      });
  }, [problems, search, platformFilter, difficultyFilter, topicFilter, dateFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(Math.ceil(filteredProblems.length / ITEMS_PER_PAGE), 1);
  const paginatedProblems = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProblems.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredProblems, currentPage]);

  const difficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty.toUpperCase()) {
      case "EASY": return "success";
      case "MEDIUM": return "warning";
      case "HARD":
      case "EXPERT": return "danger";
      default: return "default";
    }
  };

  const getRevisionStatusLabel = (step: number) => {
    if (step === 0) return "New";
    if (step === 5) return "Revised";
    return `Step ${step}/5`;
  };

  return (
    <div className="space-y-4">
      {/* Filtering Toolbar */}
      <div className="grid gap-3 md:grid-cols-6 items-end bg-slate-55/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Search Title</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
            <Input
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              placeholder="Search problem name..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Platform</label>
          <Select
            value={platformFilter}
            onChange={(e) => handleFilterChange(setPlatformFilter, e.target.value)}
            options={[{ value: "ALL", label: "All Platforms" }, ...DSA_PLATFORMS.map(p => ({ value: p, label: p }))]}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Difficulty</label>
          <Select
            value={difficultyFilter}
            onChange={(e) => handleFilterChange(setDifficultyFilter, e.target.value)}
            options={[
              { value: "ALL", label: "All" },
              { value: "EASY", label: "Easy" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HARD", label: "Hard" },
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Topic</label>
          <Select
            value={topicFilter}
            onChange={(e) => handleFilterChange(setTopicFilter, e.target.value)}
            options={[{ value: "ALL", label: "All Topics" }, ...DSA_TOPICS.map(t => ({ value: t, label: t }))]}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort By</label>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: "NEWEST", label: "Newest Solved" },
              { value: "OLDEST", label: "Oldest Solved" },
              { value: "FASTEST", label: "Solve Time" },
              { value: "SCORE_HIGH", label: "AI Score" },
            ]}
          />
        </div>
      </div>

      {/* Date Range Options */}
      <div className="flex gap-2">
        {[
          { value: "ALL", label: "All History" },
          { value: "TODAY", label: "Today" },
          { value: "WEEK", label: "This Week" },
          { value: "MONTH", label: "This Month" },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => handleFilterChange(setDateFilter, btn.value)}
            className={`text-xs font-medium px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${dateFilter === btn.value ? "bg-indigo-650 text-white border-indigo-600 shadow" : "bg-white dark:bg-slate-900 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="space-y-2.5">
        {paginatedProblems.length > 0 ? (
          paginatedProblems.map((problem) => (
            <div
              key={problem.id}
              onClick={() => onProblemClick(problem)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer duration-200"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-500 shrink-0">
                  <span className="text-[10px] font-bold font-mono tracking-wide uppercase">{problem.platform.slice(0, 4)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                    {problem.title}
                    {problem.url && (
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-indigo-600"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(problem.solvedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {problem.timeTaken ? `${problem.timeTaken} mins` : "N/A"}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-indigo-500 dark:text-indigo-400">{problem.topic}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 mt-3 sm:mt-0 justify-end">
                {/* Revision Badge */}
                <Badge variant={problem.revisionStep === 5 ? "success" : "default"} className="font-semibold text-[10px] uppercase">
                  {getRevisionStatusLabel(problem.revisionStep)}
                </Badge>

                {/* AI Analysis Score Badge */}
                {problem.aiScore !== null && problem.aiScore !== undefined ? (
                  <Badge 
                    className={`font-mono font-bold px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${problem.aiScore >= 80 ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-200" : problem.aiScore >= 50 ? "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border-amber-200" : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/20 border-red-200"}`}
                  >
                    <BrainCircuit className="h-3.5 w-3.5" />
                    {problem.aiScore}
                  </Badge>
                ) : (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <RefreshCcw className="h-3 w-3 animate-pulse" />
                    Not analyzed
                  </span>
                )}

                <Badge variant={difficultyBadgeVariant(problem.difficulty)} className="font-semibold text-[10px] uppercase">
                  {problem.difficulty}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <BrainCircuit className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-350">No problems found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px]">Try adjusting your search query, difficulty filters, or log a new problem.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
          <span className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="h-8 w-8 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="h-8 w-8 rounded-lg cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
