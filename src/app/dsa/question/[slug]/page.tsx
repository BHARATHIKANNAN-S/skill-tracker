"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CodeEditor from "@/components/dsa/code-editor";
import {
  ArrowLeft,
  Sparkles,
  Bookmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Send,
  Save,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Code2,
  Terminal,
  Activity,
  ThumbsUp,
  AlertTriangle,
  Lightbulb
} from "lucide-react";

interface QuestionDetails {
  id: string;
  leetcodeId: number | null;
  title: string;
  slug: string;
  difficulty: string;
  topic: string;
  description: string;
  constraints: string;
  examples: { input: string; output: string; explanation?: string }[];
  inputFormat: string | null;
  outputFormat: string | null;
  hints: string[];
  tags: string[];
  companies: string[];
  acceptanceRate: number;
  estimatedTime: number;
  frequency: number;
  isBookmarked: boolean;
  status: string;
  javaSolution: string | null;
  cppSolution: string | null;
  pythonSolution: string | null;
  javascriptSolution: string | null;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  similarQuestions: { title: string; slug: string; difficulty: string }[];
  leetcodeUrl: string | null;
}

interface AiExplanation {
  simpleExplanation: string;
  whatIsAsking: string;
  bruteForce: { description: string; time: string; space: string };
  better: { description: string; time: string; space: string };
  optimal: { description: string; time: string; space: string };
  whyOptimalWorks: string;
  dryRun: string;
  timeComplexity: string;
  spaceComplexity: string;
  edgeCases: string[];
  interviewTips: string[];
  commonMistakes: string[];
}

interface AiReview {
  correctness: string;
  mistakes: string;
  optimization: string;
  betterVariableNames: string;
  timeComplexity: string;
  spaceComplexity: string;
  codingStyle: string;
  edgeCases: string;
  finalRating: number;
}

interface Discussion {
  id: string;
  studentName: string;
  studentPhoto: string | null;
  content: string;
  parentId: string | null;
  createdAt: string;
}

export default function QuestionDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const slug = resolvedParams.slug;

  const [question, setQuestion] = useState<QuestionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState<"description" | "explain" | "hints" | "solution" | "notes" | "discussions">("description");

  // Code editor states
  const [editorLang, setEditorLang] = useState("JavaScript");
  const [codeContent, setCodeContent] = useState("");

  // AI & Interactive feature states
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<AiExplanation | null>(null);

  const [loadingHints, setLoadingHints] = useState(false);
  const [hintsList, setHintsList] = useState<string[]>([]);
  const [unlockedHintsCount, setUnlockedHintsCount] = useState(1);

  const [showingSolutions, setShowingSolutions] = useState(false);
  const [solutionLangTab, setSolutionLangTab] = useState("JavaScript");

  const [reviewing, setReviewing] = useState(false);
  const [codeReview, setCodeReview] = useState<AiReview | null>(null);

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // User Notes state
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Discussions state
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTarget, setReplyTarget] = useState<Discussion | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchQuestionDetails();
    fetchNotes();
    fetchDiscussions();
  }, [slug]);

  // Initial code template set on language load or question load
  useEffect(() => {
    if (question) {
      if (editorLang === "Java") setCodeContent(question.javaSolution || "");
      else if (editorLang === "C++") setCodeContent(question.cppSolution || "");
      else if (editorLang === "Python") setCodeContent(question.pythonSolution || "");
      else setCodeContent(question.javascriptSolution || "");
    }
  }, [question, editorLang]);

  async function fetchQuestionDetails() {
    setLoading(true);
    try {
      const res = await fetch(`/api/questions/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setQuestion(data);
      } else {
        router.push("/dsa");
      }
    } catch (err) {
      console.error("Failed to load question details:", err);
    } finally {
      setLoading(false);
    }
  }

  // Bookmarking
  async function toggleBookmark() {
    if (!question) return;
    try {
      const res = await fetch(`/api/questions/${slug}/bookmark`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setQuestion(prev => prev ? { ...prev, isBookmarked: data.bookmarked } : null);
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  }

  // Fetch Notes
  async function fetchNotes() {
    try {
      const res = await fetch(`/api/questions/${slug}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotesText(data.note || "");
      }
    } catch (err) {
      console.error("Notes fetch error:", err);
    }
  }

  // Save Notes (Auto-saves on input stop)
  async function handleNotesChange(text: string) {
    setNotesText(text);
    setSaveStatus("Typing...");

    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);

    notesTimeoutRef.current = setTimeout(async () => {
      setSavingNotes(true);
      setSaveStatus("Saving...");
      try {
        const res = await fetch(`/api/questions/${slug}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text })
        });
        if (res.ok) {
          setSaveStatus("Saved successfully");
        } else {
          setSaveStatus("Save failed");
        }
      } catch (err) {
        setSaveStatus("Save error");
      } finally {
        setSavingNotes(false);
      }
    }, 1000);
  }

  // Fetch Discussions
  async function fetchDiscussions() {
    try {
      const res = await fetch(`/api/questions/${slug}/discussions`);
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data);
      }
    } catch (err) {
      console.error("Discussions fetch error:", err);
    }
  }

  // Post Discussion
  async function postComment(parentId: string | null = null) {
    const text = parentId ? replyText : newComment;
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/questions/${slug}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, parentId })
      });

      if (res.ok) {
        if (parentId) {
          setReplyText("");
          setReplyTarget(null);
        } else {
          setNewComment("");
        }
        fetchDiscussions();
      }
    } catch (err) {
      console.error("Comment post error:", err);
    }
  }

  // Trigger AI Explanation
  async function generateAiExplanation() {
    if (!question) return;
    setExplaining(true);
    setActiveLeftTab("explain");
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: question.title,
          description: question.description,
          constraints: question.constraints,
          examples: question.examples
        })
      });

      if (res.ok) {
        const data = await res.json();
        setExplanation(data);
      }
    } catch (err) {
      console.error("AI explanation error:", err);
    } finally {
      setExplaining(false);
    }
  }

  // Trigger Hints
  async function fetchHints() {
    if (!question) return;
    if (hintsList.length > 0) {
      // Just increase unlocked count
      setUnlockedHintsCount(prev => Math.min(prev + 1, 4));
      return;
    }

    setLoadingHints(true);
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: question.title,
          description: question.description
        })
      });

      if (res.ok) {
        const data = await res.json();
        setHintsList(data.hints || []);
        setUnlockedHintsCount(1);
      }
    } catch (err) {
      console.error("Hints error:", err);
    } finally {
      setLoadingHints(false);
    }
  }

  // Trigger AI Code Review
  async function reviewSubmittedCode() {
    if (!question) return;
    setReviewing(true);
    setConsoleOutput(null);
    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeContent,
          language: editorLang,
          title: question.title,
          description: question.description
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCodeReview(data);
        setActiveLeftTab("explain"); // Open AI panel to show review card
      }
    } catch (err) {
      console.error("AI review error:", err);
    } finally {
      setReviewing(false);
    }
  }

  // Run Code
  async function handleRunCode() {
    if (!question) return;
    setRunning(true);
    setConsoleOutput({ type: "info", text: "Running code against example test cases..." });
    try {
      const res = await fetch(`/api/questions/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeContent,
          language: editorLang,
          mode: "run"
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.correct) {
          setConsoleOutput({
            type: "success",
            text: `STATUS: Success\nRuntime: ${data.runtime} ms\nMemory: ${data.memory} KB\n\nCONSOLE OUTPUT:\n${data.feedback}`
          });
        } else {
          setConsoleOutput({
            type: "error",
            text: `STATUS: FAILED\n\nERROR:\n${data.feedback}`
          });
        }
      }
    } catch (err) {
      setConsoleOutput({ type: "error", text: "Execution request failed." });
    } finally {
      setRunning(false);
    }
  }

  // Submit Code
  async function handleSubmitCode() {
    if (!question) return;
    setSubmitting(true);
    setConsoleOutput({ type: "info", text: "Submitting code and running validation tests..." });
    try {
      const res = await fetch(`/api/questions/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeContent,
          language: editorLang,
          mode: "submit"
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.correct) {
          setConsoleOutput({
            type: "success",
            text: `STATUS: Accepted\nRuntime: ${data.runtime} ms\nMemory: ${data.memory} KB\nXP Earned: +15 XP\nCoins: +3 Coins\n\nFEEDBACK:\n${data.feedback}`
          });
          setQuestion(prev => prev ? { ...prev, status: "SOLVED" } : null);
        } else {
          setConsoleOutput({
            type: "error",
            text: `STATUS: Wrong Answer / Compiler Error\n\nDETAILS:\n${data.feedback}`
          });
        }
      }
    } catch (err) {
      setConsoleOutput({ type: "error", text: "Submission request failed." });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !question) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <span className="text-sm font-semibold text-slate-500">Workspace Loading...</span>
        </div>
      </DashboardLayout>
    );
  }

  const difficultyMeta = {
    EASY: { color: "text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50/10", text: "Easy" },
    MEDIUM: { color: "text-amber-600 dark:text-amber-400 border-amber-250 bg-amber-50/10", text: "Medium" },
    HARD: { color: "text-rose-600 dark:text-rose-400 border-rose-200 bg-rose-50/10", text: "Hard" }
  }[question.difficulty] || { color: "text-slate-500", text: question.difficulty };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Link & Title Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/dsa/${question.topic.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm text-slate-500 font-semibold hover:text-indigo-650 flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to {question.topic}
          </Link>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={toggleBookmark}
              className={`rounded-xl h-9 gap-1.5 cursor-pointer ${
                question.isBookmarked 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20" 
                  : "border-slate-200 dark:border-slate-800 text-slate-450"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${question.isBookmarked ? "fill-indigo-650 text-indigo-650" : ""}`} />
              {question.isBookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
            {question.leetcodeUrl && (
              <a href={question.leetcodeUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="rounded-xl h-9 bg-amber-500 hover:bg-amber-600 border-0 text-white gap-1.5 cursor-pointer">
                  Solve on LeetCode <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Main Split Screen Pane Workspace */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 items-start">
          
          {/* LEFT COLUMN: DESCRIPTION, AI EXPLAIN, SOLUTIONS, DISCUSSIONS */}
          <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm min-h-[650px]">
            {/* Left Column Tabs Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto bg-slate-50/50 dark:bg-slate-950/30 scrollbar-none pb-px shrink-0">
              {[
                { id: "description", label: "Problem Details", icon: BookOpen },
                { id: "explain", label: "AI Explanation", icon: Sparkles },
                { id: "hints", label: "Hints", icon: HelpCircle },
                { id: "solution", label: "Show Solution", icon: Code2 },
                { id: "notes", label: "My Notes", icon: Save },
                { id: "discussions", label: "Discussion", icon: MessageSquare }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeLeftTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveLeftTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-4.5 py-3 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      active 
                        ? "border-indigo-600 text-indigo-650 dark:text-indigo-400 font-extrabold" 
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Left Column Contents Area */}
            <div className="p-6 flex-1 overflow-y-auto max-h-[600px]">
              <AnimatePresence mode="wait">
                {activeLeftTab === "description" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {/* Header */}
                    <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-850 pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-mono text-slate-400 font-bold">
                          #{question.leetcodeId || "N/A"}
                        </span>
                        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{question.title}</h2>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1 items-center">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border ${difficultyMeta.color}`}>
                          {difficultyMeta.text}
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-750 px-2 py-0.5 rounded-lg">
                          Acceptance: {question.acceptanceRate}%
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-750 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Activity className="h-3 w-3 text-indigo-450" /> Frequency: {question.frequency}%
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-750 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" /> Solve Time: {question.estimatedTime}m
                        </span>
                      </div>
                    </div>

                    {/* Problem Statement */}
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Problem Description</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                        {question.description}
                      </p>
                    </div>

                    {/* Input Output Formats */}
                    {question.inputFormat && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Input Format</h4>
                        <p className="text-xs text-slate-650 dark:text-slate-400">{question.inputFormat}</p>
                      </div>
                    )}
                    {question.outputFormat && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Output Format</h4>
                        <p className="text-xs text-slate-650 dark:text-slate-400">{question.outputFormat}</p>
                      </div>
                    )}

                    {/* Constraints */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Constraints</h4>
                      <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                        {question.constraints}
                      </div>
                    </div>

                    {/* Examples */}
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Examples</h4>
                      {question.examples.map((ex, index) => (
                        <div key={index} className="space-y-1.5">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Example {index + 1}:</h5>
                          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-1 text-xs font-mono">
                            <div><span className="text-slate-400">Input:</span> {ex.input}</div>
                            <div><span className="text-slate-400">Output:</span> {ex.output}</div>
                            {ex.explanation && (
                              <div className="mt-2 text-slate-450 leading-relaxed font-sans italic">
                                <span className="font-bold font-mono not-italic text-slate-400">Explanation:</span> {ex.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Company Asked logos */}
                    {question.companies && question.companies.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Companies Asked</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {question.companies.map(c => (
                            <span key={c} className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-xl">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Similar questions */}
                    {question.similarQuestions && question.similarQuestions.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Similar Questions</h4>
                        <div className="flex flex-col gap-2">
                          {question.similarQuestions.map((sim, i) => (
                            <Link 
                              key={i} 
                              href={`/dsa/question/${sim.slug}`}
                              className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              <ChevronRight className="h-3 w-3" /> {sim.title}
                              <Badge className="ml-1 scale-90" variant="default">{sim.difficulty}</Badge>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeLeftTab === "explain" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">AI Explainer Arena</h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Gemini analyzes complexities, brute force, dry runs, and edge cases.</p>
                      </div>
                      <Button
                        onClick={generateAiExplanation}
                        disabled={explaining}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold h-9 px-4 rounded-xl border-0 cursor-pointer text-xs"
                      >
                        <Sparkles className="h-4 w-4" /> 
                        {explaining ? "AI Thinking..." : "Explain with AI"}
                      </Button>
                    </div>

                    {/* code review card output if reviewed */}
                    {codeReview && (
                      <Card className="border-indigo-250 dark:border-indigo-900/40 bg-indigo-50/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-indigo-650 dark:text-indigo-400 text-sm flex items-center gap-1.5">
                            <Code2 className="h-4.5 w-4.5" /> AI Code Review Output
                          </h4>
                          <Badge variant="warning" className="font-mono text-xs font-black px-2 py-0.5">
                            Rating: {codeReview.finalRating}/100
                          </Badge>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 text-xs">
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold block">Correctness Check</span>
                            <span className="text-slate-700 dark:text-slate-350">{codeReview.correctness}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold block">Mistakes Found</span>
                            <span className="text-slate-700 dark:text-slate-350">{codeReview.mistakes}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold block">Optimization</span>
                            <span className="text-slate-700 dark:text-slate-350">{codeReview.optimization}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold block">Variable Naming</span>
                            <span className="text-slate-700 dark:text-slate-350">{codeReview.betterVariableNames}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold block">Style critique</span>
                            <span className="text-slate-700 dark:text-slate-350">{codeReview.codingStyle}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold block">Edge Cases covered</span>
                            <span className="text-slate-700 dark:text-slate-350">{codeReview.edgeCases}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 font-bold block">Complexity (Time / Space)</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-350">
                              Time: {codeReview.timeComplexity} | Space: {codeReview.spaceComplexity}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => setCodeReview(null)}
                          className="w-full text-center text-xs text-indigo-650 hover:underline"
                        >
                          Dismiss Review
                        </Button>
                      </Card>
                    )}

                    {explaining && (
                      <div className="space-y-3 py-6">
                        <div className="h-6 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg w-1/3" />
                        <div className="h-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                        <div className="h-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                      </div>
                    )}

                    {!explanation && !explaining && !codeReview && (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-450 space-y-3">
                        <Sparkles className="h-8 w-8 text-indigo-400 animate-pulse" />
                        <p className="text-xs">Click &quot;Explain with AI&quot; to get a deep conceptual breakdown of this problem.</p>
                      </div>
                    )}

                    {explanation && !explaining && (
                      <div className="space-y-5 animate-fadeIn">
                        {/* Summary & Translation */}
                        <div className="space-y-1.5">
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">Simple English Explanation</h4>
                          <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed">{explanation.simpleExplanation}</p>
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">What is it asking?</h4>
                          <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed">{explanation.whatIsAsking}</p>
                        </div>

                        {/* Approach breakdown cards */}
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">Algorithmic Approaches</h4>
                        <div className="grid gap-4 grid-cols-1">
                          {/* Brute force */}
                          <Card className="rounded-xl border-slate-100 p-4">
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">Approach 1: Brute Force</span>
                            <p className="text-xs text-slate-700 dark:text-slate-350 mt-1 leading-relaxed">{explanation.bruteForce.description}</p>
                            <div className="mt-2.5 flex gap-4 text-[10px] font-mono text-slate-450">
                              <span>Time: {explanation.bruteForce.time}</span>
                              <span>Space: {explanation.bruteForce.space}</span>
                            </div>
                          </Card>

                          {/* Better approach */}
                          {explanation.better && explanation.better.description !== "N/A" && (
                            <Card className="rounded-xl border-slate-100 p-4">
                              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">Approach 2: Better Approach</span>
                              <p className="text-xs text-slate-700 dark:text-slate-350 mt-1 leading-relaxed">{explanation.better.description}</p>
                              <div className="mt-2.5 flex gap-4 text-[10px] font-mono text-slate-450">
                                <span>Time: {explanation.better.time}</span>
                                <span>Space: {explanation.better.space}</span>
                              </div>
                            </Card>
                          )}

                          {/* Optimal approach */}
                          <Card className="rounded-xl border-indigo-200 bg-indigo-50/5 p-4">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Approach 3: Optimal Approach</span>
                            <p className="text-xs text-slate-700 dark:text-slate-350 mt-1 leading-relaxed">{explanation.optimal.description}</p>
                            <p className="text-xs text-indigo-650 dark:text-indigo-400 mt-2 font-semibold">Why this works: {explanation.whyOptimalWorks}</p>
                            <div className="mt-2.5 flex gap-4 text-[10px] font-mono text-slate-450">
                              <span>Time: {explanation.optimal.time}</span>
                              <span>Space: {explanation.optimal.space}</span>
                            </div>
                          </Card>
                        </div>

                        {/* Dry Run */}
                        <div className="space-y-1.5">
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">Step-by-step Dry Run</h4>
                          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed">
                            {explanation.dryRun}
                          </div>
                        </div>

                        {/* Complexity */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Time Complexity Justification</span>
                            <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed">{explanation.timeComplexity}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Space Complexity Justification</span>
                            <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed">{explanation.spaceComplexity}</p>
                          </div>
                        </div>

                        {/* Edge Cases, Tips, Mistakes */}
                        <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-amber-500" /> Corner Edge Cases</span>
                            <ul className="list-disc list-inside text-xs text-slate-650 dark:text-slate-400 space-y-1 pl-1">
                              {explanation.edgeCases.map((e, idx) => <li key={idx}>{e}</li>)}
                            </ul>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Lightbulb className="h-4 w-4 text-emerald-500" /> Key Interview Tips</span>
                            <ul className="list-disc list-inside text-xs text-slate-650 dark:text-slate-400 space-y-1 pl-1">
                              {explanation.interviewTips.map((t, idx) => <li key={idx}>{t}</li>)}
                            </ul>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 text-rose-600"><AlertTriangle className="h-4 w-4 text-rose-500" /> Common Mistakes</span>
                            <ul className="list-disc list-inside text-xs text-slate-650 dark:text-slate-400 space-y-1 pl-1">
                              {explanation.commonMistakes.map((m, idx) => <li key={idx}>{m}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeLeftTab === "hints" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Need Hint?</h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Conceptual clues that nudge you in the right direction without spoiling code.</p>
                      </div>
                      <Button
                        onClick={fetchHints}
                        disabled={loadingHints}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-9 px-4 border-0 rounded-xl cursor-pointer text-xs flex items-center gap-1.5"
                      >
                        <Lightbulb className="h-4.5 w-4.5" />
                        {loadingHints ? "Loading Clues..." : hintsList.length > 0 ? `Unlock Hint ${unlockedHintsCount + 1}` : "Get AI Hints"}
                      </Button>
                    </div>

                    {loadingHints && (
                      <div className="space-y-3 py-6">
                        <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                        <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                      </div>
                    )}

                    {!hintsList.length && !loadingHints && (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-450 space-y-3">
                        <Lightbulb className="h-8 w-8 text-amber-500 animate-bounce" />
                        <p className="text-xs">Stuck? Request conceptual clues from Gemini. No spoilers!</p>
                      </div>
                    )}

                    {hintsList.length > 0 && (
                      <div className="space-y-4 animate-fadeIn">
                        {hintsList.slice(0, unlockedHintsCount).map((hint, idx) => {
                          const isFinal = idx === 3;
                          return (
                            <Card 
                              key={idx} 
                              className={`p-4 rounded-xl border ${
                                isFinal 
                                  ? "bg-rose-50/10 border-rose-200" 
                                  : "bg-slate-50/50 border-slate-150"
                              }`}
                            >
                              <span className={`text-[10px] font-black uppercase tracking-widest ${isFinal ? "text-rose-500" : "text-amber-500"}`}>
                                {isFinal ? "Final Hint: The Push" : `Hint ${idx + 1}`}
                              </span>
                              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed mt-1">
                                {hint}
                              </p>
                            </Card>
                          );
                        })}

                        {unlockedHintsCount < 4 && (
                          <div className="text-center py-2">
                            <span className="text-[10px] text-slate-400 font-semibold italic">
                              Click &quot;Unlock Hint {unlockedHintsCount + 1}&quot; above to reveal the next conceptual clue.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeLeftTab === "solution" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Curated Explanatory Solutions</h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Examine complete implementation files written in 4 languages.</p>
                      </div>
                      <Button
                        onClick={() => setShowingSolutions(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 px-4 border-0 rounded-xl cursor-pointer text-xs"
                      >
                        Reveal Solution
                      </Button>
                    </div>

                    {!showingSolutions && (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-450 space-y-3">
                        <Code2 className="h-8 w-8 text-indigo-500" />
                        <p className="text-xs">Click the button above to unlock the solutions. Try solving first!</p>
                      </div>
                    )}

                    {showingSolutions && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* Sub language tabs */}
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 shrink-0 overflow-x-auto">
                          {["Java", "C++", "Python", "JavaScript"].map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setSolutionLangTab(lang)}
                              className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                solutionLangTab === lang 
                                  ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm" 
                                  : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>

                        {/* Language detailed solution output */}
                        <div className="space-y-4">
                          <div className="relative rounded-xl overflow-hidden border border-slate-150 dark:border-slate-800 bg-slate-900 p-4 font-mono text-xs text-white max-h-[350px] overflow-y-auto whitespace-pre">
                            {
                              {
                                Java: question.javaSolution,
                                "C++": question.cppSolution,
                                Python: question.pythonSolution,
                                JavaScript: question.javascriptSolution
                              }[solutionLangTab]
                            }
                          </div>

                          <Card className="p-4 rounded-xl border border-slate-150">
                            <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-450">Complexity Analysis</h4>
                            <div className="mt-2.5 grid gap-3 sm:grid-cols-2 text-xs font-mono">
                              <div>
                                <span className="font-bold text-slate-400 block uppercase text-[10px]">Time Complexity</span>
                                <span className="text-slate-850 dark:text-slate-200">{question.timeComplexity || "O(N)"}</span>
                              </div>
                              <div>
                                <span className="font-bold text-slate-400 block uppercase text-[10px]">Space Complexity</span>
                                <span className="text-slate-850 dark:text-slate-200">{question.spaceComplexity || "O(1)"}</span>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeLeftTab === "notes" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Personal Problem Notes</h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Write notes, draw code flows, and save them permanently in MongoDB.</p>
                      </div>
                      <span className="text-[10px] text-slate-450 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                        {saveStatus || "Synced"}
                      </span>
                    </div>

                    <textarea
                      value={notesText}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="Write down your conceptual ideas, logic diagrams, or solutions constraints here..."
                      className="w-full h-96 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-350 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
                    />

                    <div className="flex justify-end text-xs text-slate-400 italic">
                      Notes are automatically saved as you type.
                    </div>
                  </motion.div>
                )}

                {activeLeftTab === "discussions" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    <div className="pb-3 border-b border-slate-100 dark:border-slate-850">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Discussion Board</h3>
                      <p className="text-[10px] text-slate-500 font-semibold">Ask doubts, help peers, or discuss approach strategies.</p>
                    </div>

                    {/* Main post comment form */}
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Ask a doubt or write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="rounded-xl border-slate-200 focus-visible:ring-1 focus-visible:ring-indigo-500 text-xs"
                      />
                      <Button
                        onClick={() => postComment(null)}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl h-10 px-4 cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Comments list thread */}
                    <div className="space-y-4 pt-2">
                      {discussions.filter(d => !d.parentId).length > 0 ? (
                        discussions.filter(d => !d.parentId).map((comment) => {
                          const replies = discussions.filter(r => r.parentId === comment.id);
                          return (
                            <div key={comment.id} className="border border-slate-100 dark:border-slate-850 rounded-2xl p-4 bg-slate-50/20 space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black">
                                  {comment.studentName?.charAt(0) || "U"}
                                </div>
                                <div className="text-xs">
                                  <span className="font-extrabold text-slate-850 dark:text-slate-200 mr-1.5">{comment.studentName}</span>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-350 pl-9 leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                              </p>

                              {/* Action buttons */}
                              <div className="flex items-center gap-4 text-[10px] text-indigo-650 dark:text-indigo-400 pl-9 font-extrabold">
                                <button 
                                  onClick={() => setReplyTarget(comment)} 
                                  className="hover:underline cursor-pointer flex items-center gap-1"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" /> Reply
                                </button>
                              </div>

                              {/* Replies listing */}
                              {replies.length > 0 && (
                                <div className="pl-9 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-850/50">
                                  {replies.map((reply) => (
                                    <div key={reply.id} className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center text-white text-[9px] font-black">
                                          {reply.studentName?.charAt(0) || "U"}
                                        </div>
                                        <div className="text-[11px]">
                                          <span className="font-extrabold text-slate-800 dark:text-slate-200 mr-1.5">{reply.studentName}</span>
                                          <span className="text-[9px] text-slate-400 font-semibold">
                                            {new Date(reply.createdAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-[11px] text-slate-650 dark:text-slate-400 pl-8 leading-relaxed whitespace-pre-wrap">
                                        {reply.content}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reply form */}
                              {replyTarget?.id === comment.id && (
                                <div className="pl-9 pt-2 flex gap-2">
                                  <Input
                                    type="text"
                                    placeholder={`Reply to ${comment.studentName}...`}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="rounded-xl border-slate-200 focus-visible:ring-1 focus-visible:ring-indigo-500 text-xs h-9"
                                  />
                                  <Button
                                    onClick={() => postComment(comment.id)}
                                    className="bg-indigo-650 text-white rounded-xl h-9 px-3.5 cursor-pointer text-xs border-0"
                                  >
                                    Post
                                  </Button>
                                  <Button
                                    onClick={() => setReplyTarget(null)}
                                    variant="ghost"
                                    className="rounded-xl h-9 px-2 text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-10 text-slate-400 text-xs">
                          No doubts posted yet. Be the first to ask!
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT COLUMN: WORKSPACE CODE EDITOR & COMPILER PANEL */}
          <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Editor Workspace Container */}
            <div className="p-1.5 flex-1">
              <CodeEditor
                value={codeContent}
                onChange={setCodeContent}
                language={editorLang}
                onLanguageChange={setEditorLang}
              />
            </div>

            {/* Run Submit Action Buttons */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between gap-4 shrink-0">
              <Button
                variant="outline"
                onClick={reviewSubmittedCode}
                disabled={reviewing || running || submitting}
                className="border-slate-200 hover:bg-slate-100 dark:border-slate-800 rounded-xl h-10 px-4 text-xs font-bold gap-1.5 cursor-pointer bg-white dark:bg-slate-900"
              >
                <Sparkles className="h-4 w-4 text-indigo-500" />
                {reviewing ? "Reviewing..." : "Review Code"}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleRunCode}
                  disabled={running || submitting || reviewing}
                  className="border-slate-200 hover:bg-slate-100 dark:border-slate-800 rounded-xl h-10 px-4.5 text-xs font-bold gap-1.5 cursor-pointer bg-white dark:bg-slate-900"
                >
                  <Terminal className="h-4 w-4 text-slate-400" />
                  {running ? "Running..." : "Run"}
                </Button>
                <Button
                  onClick={handleSubmitCode}
                  disabled={submitting || running || reviewing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-5 text-xs font-bold gap-1.5 cursor-pointer border-0"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>

            {/* Console / Compiler Panel */}
            {consoleOutput && (
              <div className="bg-slate-950 p-5 font-mono text-xs border-t border-slate-850 animate-slideUp">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-850 mb-3">
                  <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-indigo-400" /> Output Console
                  </span>
                  <button 
                    onClick={() => setConsoleOutput(null)} 
                    className="hover:text-white cursor-pointer text-[10px]"
                  >
                    Clear Console
                  </button>
                </div>
                <div className={`whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto ${
                  consoleOutput.type === "success" 
                    ? "text-emerald-400" 
                    : consoleOutput.type === "error" 
                      ? "text-rose-400" 
                      : "text-indigo-400"
                }`}>
                  {consoleOutput.text}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
