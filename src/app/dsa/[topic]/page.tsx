"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  BookOpen,
  Bookmark,
  Building,
  Filter,
  RefreshCw,
  FolderOpen
} from "lucide-react";

interface Question {
  id: string;
  leetcodeId: number | null;
  title: string;
  slug: string;
  difficulty: string;
  topic: string;
  leetcodeUrl: string | null;
  acceptanceRate: number;
  estimatedTime: number;
  status: string; // "SOLVED" | "IN_PROGRESS" | "NOT_STARTED"
  isBookmarked: boolean;
  tags: string[];
  companies: string[];
}

const SLUG_TO_TOPIC_NAME: Record<string, string> = {
  "arrays": "Arrays",
  "strings": "Strings",
  "hashmap": "HashMap",
  "stack": "Stack",
  "queue": "Queue",
  "linked-list": "Linked List",
  "binary-tree": "Binary Tree",
  "bst": "BST",
  "heap": "Heap",
  "binary-search": "Binary Search",
  "sliding-window": "Sliding Window",
  "two-pointers": "Two Pointers",
  "prefix-sum": "Prefix Sum",
  "greedy": "Greedy",
  "recursion": "Recursion",
  "backtracking": "Backtracking",
  "graph": "Graph",
  "trie": "Trie",
  "dynamic-programming": "Dynamic Programming",
  "bit-manipulation": "Bit Manipulation",
  "union-find": "Union Find",
  "segment-tree": "Segment Tree",
  "math": "Math",
  "sorting": "Sorting",
  "searching": "Searching"
};

export default function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const topicSlug = resolvedParams.topic.toLowerCase();
  const topicName = SLUG_TO_TOPIC_NAME[topicSlug] || resolvedParams.topic;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SOLVED" | "UNSOLVED">("ALL");
  const [companyFilter, setCompanyFilter] = useState("");

  useEffect(() => {
    fetchTopicQuestions();
  }, [topicSlug]);

  async function fetchTopicQuestions() {
    setLoading(true);
    try {
      const res = await fetch(`/api/questions/topic/${topicSlug}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error("Failed to load topic questions:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle bookmark toggle
  async function toggleBookmark(e: React.MouseEvent, question: Question) {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/questions/${question.slug}/bookmark`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, isBookmarked: data.bookmarked } : q));
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  }

  // Handle solved toggle manually
  async function toggleSolved(e: React.MouseEvent, question: Question) {
    e.stopPropagation();
    const newStatus = question.status === "SOLVED" ? "NOT_STARTED" : "SOLVED";
    try {
      const res = await fetch(`/api/questions/${question.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: `// Manual Toggle\n// Marked as ${newStatus}`,
          language: "JavaScript",
          mode: newStatus === "SOLVED" ? "submit" : "run"
        })
      });

      if (res.ok) {
        setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, status: newStatus } : q));
      }
    } catch (err) {
      console.error("Failed to toggle solved status:", err);
    }
  }

  // Calculations
  const totalCount = questions.length;
  const solvedCount = questions.filter(q => q.status === "SOLVED").length;
  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Filtered List
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.leetcodeId?.toString().includes(searchQuery) ||
      q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty = 
      difficultyFilter === "ALL" || 
      q.difficulty === difficultyFilter;

    const matchesStatus = 
      statusFilter === "ALL" ||
      (statusFilter === "SOLVED" && q.status === "SOLVED") ||
      (statusFilter === "UNSOLVED" && q.status !== "SOLVED");

    const matchesCompany = 
      !companyFilter || 
      q.companies.some(c => c.toLowerCase().includes(companyFilter.toLowerCase()));

    return matchesSearch && matchesDifficulty && matchesStatus && matchesCompany;
  });

  // Extract unique companies for filtering dropdown
  const allCompanies = Array.from(
    new Set(questions.flatMap(q => q.companies || []))
  ).sort();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-1">
        {/* Back Link / Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
          <Link href="/dsa" className="hover:text-indigo-650 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Topics
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">{topicName}</span>
        </div>

        {/* Header Hero Area */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-indigo-500" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{topicName}</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Curated roadmap of important {topicName} problems commonly asked in technical interviews.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 lg:w-1/3 shrink-0">
            <div className="w-full text-center sm:text-right space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Topic Progress</span>
              <span className="text-lg font-black font-mono text-indigo-650 dark:text-indigo-400">
                {solvedCount} / {totalCount} Problems ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search & Multiple Filters */}
        <div className="bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-200 dark:border-slate-850 p-4 rounded-2xl shadow-sm space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search problem name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 w-full rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-500 text-xs"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl px-3 py-2 text-slate-600 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer h-10"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl px-3 py-2 text-slate-600 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer h-10"
            >
              <option value="ALL">All Statuses</option>
              <option value="SOLVED">Solved</option>
              <option value="UNSOLVED">Unsolved</option>
            </select>

            {/* Company Filter */}
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl px-3 py-2 text-slate-600 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer h-10"
            >
              <option value="">All Companies</option>
              {allCompanies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Cards List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col gap-4 py-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-850" />
              ))}
            </div>
          ) : filteredQuestions.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {filteredQuestions.map((q) => {
                const diffColors = {
                  EASY: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30",
                  MEDIUM: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
                  HARD: "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30"
                }[q.difficulty as "EASY" | "MEDIUM" | "HARD"] || "bg-slate-50 text-slate-700";

                return (
                  <motion.div
                    key={q.id}
                    layoutId={q.id}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-stretch md:items-center gap-5 relative group"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{q.leetcodeId || q.id.slice(0, 4)}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-650 transition-colors">
                          {q.title}
                        </h3>
                        <Badge variant={q.status === "SOLVED" ? "success" : q.status === "IN_PROGRESS" ? "warning" : "default"}>
                          {q.status === "SOLVED" ? "Solved" : q.status === "IN_PROGRESS" ? "In Progress" : "Not Started"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2.5 items-center">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${diffColors}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 rounded-lg">
                          Acceptance: {q.acceptanceRate}%
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" /> {q.estimatedTime} mins
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-lg">
                          Platform: LeetCode
                        </span>
                      </div>

                      {/* Company Tags & Technical Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {q.companies && q.companies.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center mr-3">
                            <Building className="h-3 w-3 text-slate-400 mr-0.5" />
                            {q.companies.slice(0, 3).map(comp => (
                              <span key={comp} className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 px-1.5 py-px rounded">
                                {comp}
                              </span>
                            ))}
                            {q.companies.length > 3 && (
                              <span className="text-[9px] font-bold text-slate-400">+{q.companies.length - 3} more</span>
                            )}
                          </div>
                        )}

                        {q.tags && q.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center">
                            {q.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[9px] font-semibold bg-slate-50 dark:bg-slate-950/20 text-slate-400 border border-slate-200 dark:border-slate-850 px-1.5 py-px rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => toggleBookmark(e, q)}
                        className={`h-10 w-10 rounded-xl cursor-pointer ${
                          q.isBookmarked 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900" 
                            : "border-slate-200 dark:border-slate-800 text-slate-400"
                        }`}
                        title="Bookmark question"
                      >
                        <Bookmark className={`h-4.5 w-4.5 ${q.isBookmarked ? "fill-indigo-600" : ""}`} />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => toggleSolved(e, q)}
                        className={`h-10 w-10 rounded-xl cursor-pointer ${
                          q.status === "SOLVED" 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900" 
                            : "border-slate-200 dark:border-slate-800 text-slate-400"
                        }`}
                        title={q.status === "SOLVED" ? "Mark Unsolved" : "Mark Solved"}
                      >
                        <CheckCircle2 className={`h-4.5 w-4.5 ${q.status === "SOLVED" ? "fill-emerald-500 text-emerald-500" : ""}`} />
                      </Button>

                      {q.leetcodeUrl && (
                        <a 
                          href={q.leetcodeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            // Update activity to viewed/opened when solve link is clicked
                            fetch(`/api/questions/${q.slug}`);
                          }}
                        >
                          <Button 
                            variant="outline"
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 px-4 rounded-xl border-0 gap-1.5 cursor-pointer text-xs"
                          >
                            Solve on LeetCode <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      )}

                      <Button
                        onClick={() => router.push(`/dsa/question/${q.slug}`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-4 rounded-xl gap-1.5 cursor-pointer text-xs border-0"
                      >
                        Explanation
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-350 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
              <Building className="h-10 w-10 text-slate-350" />
              <p className="text-sm font-semibold text-slate-500">No questions found matching your filter criteria.</p>
              <Button 
                variant="outline" 
                onClick={() => { setSearchQuery(""); setDifficultyFilter("ALL"); setStatusFilter("ALL"); setCompanyFilter(""); }}
                className="text-xs"
              >
                Reset all filters
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
