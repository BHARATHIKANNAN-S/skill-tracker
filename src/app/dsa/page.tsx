"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  Sparkles,
  Bookmark,
  History,
  CheckCircle2,
  Circle,
  ChevronRight,
  BookmarkCheck,
  Zap,
  Clock,
  Flame,
  Award,
  ListFilter
} from "lucide-react";

// The 25 categories in the exact order requested
const ORDERED_TOPICS = [
  "Arrays",
  "Strings",
  "HashMap",
  "Stack",
  "Queue",
  "Linked List",
  "Binary Tree",
  "BST",
  "Heap",
  "Binary Search",
  "Sliding Window",
  "Two Pointers",
  "Prefix Sum",
  "Greedy",
  "Recursion",
  "Backtracking",
  "Graph",
  "Trie",
  "Dynamic Programming",
  "Bit Manipulation",
  "Union Find",
  "Segment Tree",
  "Math",
  "Sorting",
  "Searching"
];

// Helper to convert topic name to URL slug
function getTopicSlug(topicName: string): string {
  return topicName.toLowerCase().replace(/\s+/g, "-").replace(/[\/()]/g, "");
}

interface Question {
  id: string;
  leetcodeId: number | null;
  title: string;
  slug: string;
  difficulty: string;
  topic: string;
  acceptanceRate: number;
  estimatedTime: number;
  isPremium: boolean;
  status: string; // "SOLVED" | "IN_PROGRESS" | "NOT_STARTED"
  isBookmarked: boolean;
  tags: string[];
  companies: string[];
  frequency: number;
}

export default function DsaDashboardPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"categories" | "leetcode50" | "bookmarks" | "recent">("categories");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"ALL" | "EASY" | "MEDIUM" | "HARD">("ALL");

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    setLoading(true);
    try {
      const res = await fetch("/api/questions");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
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

  // Handle Solved toggle manually
  async function toggleSolved(e: React.MouseEvent, question: Question) {
    e.stopPropagation();
    const newStatus = question.status === "SOLVED" ? "NOT_STARTED" : "SOLVED";
    try {
      // Simulate submission of code
      const res = await fetch(`/api/questions/${question.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: `// Manual Toggle\n// Marked as ${newStatus}`,
          language: "JavaScript",
          mode: newStatus === "SOLVED" ? "submit" : "run" // If marking unsolved, just run (doesn't write SOLVED)
        })
      });

      if (res.ok) {
        setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, status: newStatus } : q));
      }
    } catch (err) {
      console.error("Failed to toggle solved status:", err);
    }
  }

  // Solved statistics calculation
  const totalQuestionsCount = questions.length;
  const solvedQuestions = questions.filter(q => q.status === "SOLVED");
  const solvedCount = solvedQuestions.length;

  const easyQuestions = questions.filter(q => q.difficulty === "EASY");
  const easySolved = easyQuestions.filter(q => q.status === "SOLVED").length;
  const easyTarget = 50;

  const mediumQuestions = questions.filter(q => q.difficulty === "MEDIUM");
  const mediumSolved = mediumQuestions.filter(q => q.status === "SOLVED").length;
  const mediumTarget = 80;

  const hardQuestions = questions.filter(q => q.difficulty === "HARD");
  const hardSolved = hardQuestions.filter(q => q.status === "SOLVED").length;
  const hardTarget = 30;

  const overallProgress = totalQuestionsCount > 0 
    ? Math.round((solvedCount / (easyTarget + mediumTarget + hardTarget)) * 100) 
    : 0;

  const leetCode50Questions = [...questions]
    .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
    .slice(0, 50);
  const leetCode50SolvedCount = leetCode50Questions.filter(q => q.status === "SOLVED").length;

  // Filtered questions based on search & filters
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.leetcodeId?.toString().includes(searchQuery) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty = 
      difficultyFilter === "ALL" || 
      q.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  const isSearching = searchQuery.trim().length > 0 || difficultyFilter !== "ALL";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-1">
        {/* Banner Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-indigo-400" />
                DSA Prep Arena
              </h1>
              <p className="text-slate-450 text-sm max-w-lg">
                Curated LeetCode problems ordered by placing relevance. Master each topic, review solutions in 4 languages, and leverage AI help.
              </p>
            </div>
            {/* Quick stats in banner */}
            <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl">
              <div className="flex flex-col text-center">
                <span className="text-2xl font-black text-indigo-400">{solvedCount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Solved</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="flex flex-col text-center">
                <span className="text-2xl font-black text-amber-400">{overallProgress}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Goal Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Target Summary Header */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase font-bold text-slate-500 tracking-wider flex justify-between items-center">
                Overall Progress
                <Badge className="bg-indigo-650 text-white font-bold">{overallProgress}%</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 transition-all duration-500" 
                  style={{ width: `${Math.min(overallProgress, 100)}%` }} 
                />
              </div>
              <p className="text-[11px] text-slate-500">Target goal: 160 placement problems</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-emerald-200 dark:border-emerald-950/20 bg-emerald-50/5">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider flex justify-between items-center">
                Easy
                <span className="font-mono text-sm font-black">{easySolved} / {easyTarget}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${Math.min((easySolved / easyTarget) * 100, 100)}%` }} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-amber-250 dark:border-amber-950/20 bg-amber-50/5">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider flex justify-between items-center">
                Medium
                <span className="font-mono text-sm font-black">{mediumSolved} / {mediumTarget}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500" 
                  style={{ width: `${Math.min((mediumSolved / mediumTarget) * 100, 100)}%` }} 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-rose-200 dark:border-rose-950/20 bg-rose-50/5">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider flex justify-between items-center">
                Hard
                <span className="font-mono text-sm font-black">{hardSolved} / {hardTarget}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 transition-all duration-500" 
                  style={{ width: `${Math.min((hardSolved / hardTarget) * 100, 100)}%` }} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Filters & Search Area */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search problem by name, ID (#1), or tag..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 w-full rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <Badge variant="default" className="text-xs font-semibold py-1.5 px-3 border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-500 flex items-center gap-1.5 rounded-xl">
              <ListFilter className="h-3.5 w-3.5" /> Difficulty
            </Badge>
            {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((diff) => (
              <Button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                size="sm"
                variant={difficultyFilter === diff ? "default" : "outline"}
                className={`rounded-xl font-bold h-9 px-4 text-xs cursor-pointer ${
                  difficultyFilter === diff 
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 border-0" 
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-150 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900"
                }`}
              >
                {diff === "ALL" ? "All" : diff.charAt(0) + diff.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Selection */}
        {!isSearching && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px mb-2 overflow-x-auto gap-2">
            {[
              { id: "categories", label: "Topic Categories", icon: BookOpen },
              { id: "leetcode50", label: "LeetCode Top 50", icon: Award },
              { id: "bookmarks", label: "Bookmarked Problems", icon: Bookmark },
              { id: "recent", label: "Recently Active", icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
                    active 
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold" 
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Grid View */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 py-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-800" />
              ))}
            </div>
          ) : isSearching ? (
            /* SEARCH RESULTS VIEW */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-550 uppercase tracking-wider">
                  Search Results ({filteredQuestions.length})
                </h3>
                {(searchQuery || difficultyFilter !== "ALL") && (
                  <Button 
                    variant="link" 
                    onClick={() => { setSearchQuery(""); setDifficultyFilter("ALL"); }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 p-0"
                  >
                    Clear filters
                  </Button>
                )}
              </div>

              {filteredQuestions.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredQuestions.map((q) => (
                    <QuestionCard 
                      key={q.id} 
                      question={q} 
                      onBookmark={(e) => toggleBookmark(e, q)}
                      onToggleSolved={(e) => toggleSolved(e, q)}
                      onClick={() => router.push(`/dsa/question/${q.slug}`)} 
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="No matching LeetCode problems found. Try different filters." />
              )}
            </motion.div>
          ) : (
            /* TABBED VIEWS */
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "categories" && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ORDERED_TOPICS.map((topic, index) => {
                    const topicQuestions = questions.filter(q => q.topic === topic);
                    const topicSolved = topicQuestions.filter(q => q.status === "SOLVED").length;
                    const topicTotal = topicQuestions.length;
                    // Provide a default goal value if dynamic questions are not seeded yet
                    const targetGoal = topicTotal || 5; 
                    const percent = targetGoal > 0 ? Math.min(Math.round((topicSolved / targetGoal) * 100), 100) : 0;
                    const isCompleted = topicSolved >= targetGoal && targetGoal > 0;

                    return (
                      <motion.div
                        key={topic}
                        whileHover={{ scale: 1.015 }}
                        onClick={() => router.push(`/dsa/${getTopicSlug(topic)}`)}
                        className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl relative overflow-hidden transition-all duration-200 cursor-pointer group ${
                          isCompleted 
                            ? "border-emerald-200 dark:border-emerald-950/30 bg-emerald-50/5" 
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              Topic {index + 1}
                            </span>
                            <h4 className="font-extrabold text-base text-slate-850 dark:text-slate-100 flex items-center gap-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {topic}
                              {isCompleted && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />}
                            </h4>
                          </div>
                          <Badge variant={isCompleted ? "success" : "default"} className="font-mono text-xs font-black">
                            {percent}%
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full rounded-full transition-all duration-550 ${
                              isCompleted 
                                ? "bg-emerald-500" 
                                : percent > 50 
                                  ? "bg-indigo-500" 
                                  : "bg-indigo-400"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
                          <span>{topicSolved} solved</span>
                          <span className="flex items-center gap-0.5 text-slate-400 group-hover:translate-x-1 transition-transform">
                            Practice <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {activeTab === "leetcode50" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50/50 border border-indigo-100/80 rounded-2xl">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                        <Award className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                        LeetCode Top 50 Interview Challenge
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        The 50 most frequently asked placement questions sorted by frequency. Master these to crack coding interviews!
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-600 bg-white border border-slate-100 rounded-lg px-2.5 py-1">
                        {leetCode50SolvedCount} / 50 Solved
                      </span>
                      <Badge className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold">
                        {Math.round((leetCode50SolvedCount / 50) * 100)}% Complete
                      </Badge>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-650 transition-all duration-500 shadow-sm" 
                      style={{ width: `${(leetCode50SolvedCount / 50) * 100}%` }} 
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {leetCode50Questions.map((q) => (
                      <QuestionCard 
                        key={q.id} 
                        question={q} 
                        onBookmark={(e) => toggleBookmark(e, q)}
                        onToggleSolved={(e) => toggleSolved(e, q)}
                        onClick={() => router.push(`/dsa/question/${q.slug}`)} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "bookmarks" && (
                <div className="space-y-6">
                  {/* Bookmarked Questions list */}
                  {questions.filter(q => q.isBookmarked).length > 0 ? (
                    <div className="space-y-6">
                      {/* Easy Bookmarks */}
                      {questions.filter(q => q.isBookmarked && q.difficulty === "EASY").length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400">Easy Bookmarks</h4>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {questions.filter(q => q.isBookmarked && q.difficulty === "EASY").map((q) => (
                              <QuestionCard 
                                key={q.id} 
                                question={q} 
                                onBookmark={(e) => toggleBookmark(e, q)}
                                onToggleSolved={(e) => toggleSolved(e, q)}
                                onClick={() => router.push(`/dsa/question/${q.slug}`)} 
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Medium Bookmarks */}
                      {questions.filter(q => q.isBookmarked && q.difficulty === "MEDIUM").length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-600 dark:text-amber-400">Medium Bookmarks</h4>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {questions.filter(q => q.isBookmarked && q.difficulty === "MEDIUM").map((q) => (
                              <QuestionCard 
                                key={q.id} 
                                question={q} 
                                onBookmark={(e) => toggleBookmark(e, q)}
                                onToggleSolved={(e) => toggleSolved(e, q)}
                                onClick={() => router.push(`/dsa/question/${q.slug}`)} 
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hard Bookmarks */}
                      {questions.filter(q => q.isBookmarked && q.difficulty === "HARD").length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-rose-600 dark:text-rose-400">Hard Bookmarks</h4>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {questions.filter(q => q.isBookmarked && q.difficulty === "HARD").map((q) => (
                              <QuestionCard 
                                key={q.id} 
                                question={q} 
                                onBookmark={(e) => toggleBookmark(e, q)}
                                onToggleSolved={(e) => toggleSolved(e, q)}
                                onClick={() => router.push(`/dsa/question/${q.slug}`)} 
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <EmptyState message="You haven't bookmarked any LeetCode problems yet." />
                  )}
                </div>
              )}

              {activeTab === "recent" && (
                <div className="space-y-4">
                  {questions.filter(q => q.status === "SOLVED" || q.status === "IN_PROGRESS").length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {questions
                        .filter(q => q.status === "SOLVED" || q.status === "IN_PROGRESS")
                        .slice(0, 9)
                        .map((q) => (
                          <QuestionCard 
                            key={q.id} 
                            question={q} 
                            onBookmark={(e) => toggleBookmark(e, q)}
                            onToggleSolved={(e) => toggleSolved(e, q)}
                            onClick={() => router.push(`/dsa/question/${q.slug}`)} 
                          />
                        ))}
                    </div>
                  ) : (
                    <EmptyState message="No recently viewed or solved problems found." />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

// Reuseable Question Card Component for Search, Bookmarks, and Recents
interface QuestionCardProps {
  question: Question;
  onBookmark: (e: React.MouseEvent) => void;
  onToggleSolved: (e: React.MouseEvent) => void;
  onClick: () => void;
}

function QuestionCard({ question, onBookmark, onToggleSolved, onClick }: QuestionCardProps) {
  const diffColors = {
    EASY: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30",
    MEDIUM: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30",
    HARD: "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30"
  }[question.difficulty as "EASY" | "MEDIUM" | "HARD"] || "bg-slate-50 text-slate-700";

  return (
    <Card 
      onClick={onClick}
      className="rounded-2xl border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between"
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-450 font-mono font-bold">
              #{question.leetcodeId || question.id.slice(0, 4)} • {question.topic}
            </span>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-650 transition-colors line-clamp-1">
              {question.title}
            </h4>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={onBookmark}
              className="h-7 w-7 text-slate-400 hover:text-indigo-650 rounded-lg cursor-pointer"
            >
              <Bookmark className={`h-4 w-4 ${question.isBookmarked ? "fill-indigo-600 text-indigo-600" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleSolved}
              className="h-7 w-7 text-slate-400 hover:text-emerald-500 rounded-lg cursor-pointer"
              title={question.status === "SOLVED" ? "Mark Unsolved" : "Mark Solved"}
            >
              {question.status === "SOLVED" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 pb-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${diffColors}`}>
            {question.difficulty}
          </span>
          <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg">
            Acc: {question.acceptanceRate}%
          </span>
          <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
            <Clock className="h-3 w-3 text-slate-400" /> {question.estimatedTime}m
          </span>
        </div>

        {/* Similar tags preview */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {question.tags.slice(0, 2).map(t => (
              <span key={t} className="text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1.5 py-px rounded">
                {t}
              </span>
            ))}
            {question.tags.length > 2 && (
              <span className="text-[9px] font-bold text-slate-400">+{question.tags.length - 2}</span>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-bold">
          <span className={`text-[10px] font-semibold flex items-center gap-1 ${
            question.status === "SOLVED" 
              ? "text-emerald-600 dark:text-emerald-400" 
              : question.status === "IN_PROGRESS" 
                ? "text-amber-500" 
                : "text-slate-400"
          }`}>
            {question.status === "SOLVED" ? "Solved" : question.status === "IN_PROGRESS" ? "In Progress" : "Not Started"}
          </span>

          <span className="text-indigo-650 dark:text-indigo-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px] font-bold">
            View Details <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
      <History className="h-10 w-10 text-slate-350 mb-3" />
      <p className="text-sm font-semibold text-slate-500">{message}</p>
    </div>
  );
}