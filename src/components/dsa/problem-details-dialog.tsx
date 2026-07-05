"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import CodeEditor from "./code-editor";
import AiReviewCard, { AiReviewData } from "./ai-review-card";
import { 
  Calendar, 
  Clock, 
  BrainCircuit, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Sparkles,
  ExternalLink,
  BookOpen,
  CalendarCheck,
  CheckCircle2
} from "lucide-react";
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
  code?: string | null;
  notes?: string | null;
  
  // AI fields
  aiScore?: number | null;
  aiTimeComplexity?: string | null;
  aiSpaceComplexity?: string | null;
  aiOptimal?: boolean | null;
  aiCodeQuality?: string | null;
  aiReadability?: string | null;
  aiNaming?: string | null;
  aiMemoryUsage?: string | null;
  aiReadiness?: string | null;
  aiEdgeCases?: string | null;
  aiSuggestions?: string | null;

  // Revision
  revisionStep: number;
  nextReviewAt?: string | null;
}

interface ProblemDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem | null;
  onRefresh: () => void;
}

export default function ProblemDetailsDialog({
  isOpen,
  onClose,
  problem,
  onRefresh,
}: ProblemDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form states
  const [form, setForm] = useState({
    title: problem.title || "",
    platform: problem.platform || "LeetCode",
    topic: problem.topic || "Arrays",
    difficulty: problem.difficulty || "EASY",
    url: problem.url || "",
    timeTaken: problem.timeTaken || 30,
    code: problem.code || "",
    notes: problem.notes || "",
  });

  const handleCancel = () => {
    setForm({
      title: problem.title || "",
      platform: problem.platform || "LeetCode",
      topic: problem.topic || "Arrays",
      difficulty: problem.difficulty || "EASY",
      url: problem.url || "",
      timeTaken: problem.timeTaken || 30,
      code: problem.code || "",
      notes: problem.notes || "",
    });
    setIsEditing(false);
  };

  if (!problem) return null;

  // Delete problem
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this problem from your coding journal?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/student/dsa?id=${problem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onRefresh();
        onClose();
      } else {
        alert("Failed to delete problem.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting problem.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Save edits
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/student/dsa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: problem.id,
          ...form,
          timeTaken: Number(form.timeTaken),
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        onRefresh();
      } else {
        alert("Failed to update problem.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving problem.");
    } finally {
      setIsSaving(false);
    }
  };

  // Re-run AI analysis
  const handleReanalyze = async () => {
    if (!form.code) {
      alert("Please write some code before running analysis.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const analyzeRes = await fetch("/api/student/dsa/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          language: problem.language || "Java",
          code: form.code,
          topic: form.topic,
          difficulty: form.difficulty,
        }),
      });

      if (!analyzeRes.ok) {
        throw new Error("AI analysis service failed");
      }

      const aiData = await analyzeRes.json();

      // Save the analysis directly back to the database
      const saveRes = await fetch("/api/student/dsa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: problem.id,
          ...form,
          timeTaken: Number(form.timeTaken),
          aiScore: aiData.score,
          aiTimeComplexity: aiData.timeComplexity,
          aiSpaceComplexity: aiData.spaceComplexity,
          aiOptimal: aiData.optimal,
          aiCodeQuality: aiData.codeQuality,
          aiReadability: aiData.readability,
          aiNaming: aiData.naming,
          aiMemoryUsage: aiData.memoryUsage,
          aiReadiness: aiData.readiness,
          aiEdgeCases: aiData.edgeCases,
          aiSuggestions: JSON.stringify(aiData.suggestions),
        }),
      });

      if (saveRes.ok) {
        onRefresh();
      } else {
        alert("Failed to save re-analyzed data.");
      }
    } catch (err) {
      console.error(err);
      alert("Error re-analyzing code. Please check your AI API key configurations.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Advance Spaced Repetition Revision step
  const handleMarkRevised = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/student/dsa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: problem.id,
          action: "revision",
        }),
      });
      if (res.ok) {
        onRefresh();
      } else {
        alert("Failed to mark problem as revised.");
      }
    } catch (err) {
      console.error(err);
      alert("Error marking revision.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasAiData = problem.aiScore !== null && problem.aiScore !== undefined;

  const aiReviewObj: AiReviewData | null = hasAiData ? {
    score: problem.aiScore || 0,
    timeComplexity: problem.aiTimeComplexity || "O(N)",
    spaceComplexity: problem.aiSpaceComplexity || "O(1)",
    optimal: !!problem.aiOptimal,
    codeQuality: problem.aiCodeQuality || "",
    readability: problem.aiReadability || "",
    naming: problem.aiNaming || "",
    memoryUsage: problem.aiMemoryUsage || "",
    readiness: problem.aiReadiness || "",
    edgeCases: problem.aiEdgeCases || "",
    suggestions: problem.aiSuggestions || "[]",
  } : null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent maxWidth="5xl" onClose={onClose} className="p-0 overflow-hidden flex flex-col h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            {isEditing ? (
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="text-lg font-bold h-9 w-full md:w-[350px]"
                placeholder="Problem name"
              />
            ) : (
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {problem.title}
                {problem.url && (
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-650 inline-flex"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </DialogTitle>
            )}
            
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {isEditing ? (
                <>
                  <Select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    options={DSA_PLATFORMS.map(p => ({ value: p, label: p }))}
                    className="h-8 py-0"
                  />
                  <Select
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    options={DSA_TOPICS.map(t => ({ value: t, label: t }))}
                    className="h-8 py-0"
                  />
                  <Select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    options={[
                      { value: "EASY", label: "Easy" },
                      { value: "MEDIUM", label: "Medium" },
                      { value: "HARD", label: "Hard" },
                    ]}
                    className="h-8 py-0"
                  />
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{problem.platform}</span>
                  <span>•</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{problem.topic}</span>
                  <span>•</span>
                  <Badge variant={problem.difficulty === "EASY" ? "success" : problem.difficulty === "MEDIUM" ? "warning" : "danger"}>
                    {problem.difficulty}
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || !form.title} 
                  size="sm"
                  className="gap-1 rounded-lg cursor-pointer"
                >
                  <Save className="h-4 w-4" /> Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancel} 
                  size="sm"
                  className="gap-1 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" /> Cancel
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)} 
                  size="sm"
                  className="gap-1 rounded-lg cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" /> Edit
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleDelete} 
                  disabled={isDeleting}
                  size="sm"
                  className="gap-1 rounded-lg cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Modal Main Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Spaced Repetition Panel */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-850 dark:text-slate-200">
                <CalendarCheck className="h-4 w-4 text-indigo-500" />
                Spaced Repetition System (SRS)
              </div>
              <p className="text-xs text-slate-400">
                Current Revision Interval: <Badge variant="default" className="text-[10px] uppercase font-bold">{problem.revisionStep === 0 ? "Not Started" : problem.revisionStep === 5 ? "Completed" : `Step ${problem.revisionStep}/5`}</Badge>
              </p>
              {problem.nextReviewAt && (
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  Next revision scheduled on: {new Date(problem.nextReviewAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
            {problem.revisionStep < 5 && (
              <Button 
                onClick={handleMarkRevised} 
                disabled={isSaving}
                size="sm"
                className="gap-1 shrink-0 rounded-lg cursor-pointer bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10 text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark Solved & Advance Interval
              </Button>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left Side: Code Editor & Notes (3 columns) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Problem Code */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Submissions Solution</h3>
                {isEditing ? (
                  <CodeEditor
                    value={form.code}
                    onChange={(val) => setForm({ ...form, code: val })}
                    language={problem.language || "Java"}
                  />
                ) : (
                  <CodeEditor
                    value={form.code}
                    onChange={() => {}}
                    language={problem.language || "Java"}
                    readOnly
                  />
                )}
              </div>

              {/* Personal Notes */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  Personal Revision Notes
                </h3>
                {isEditing ? (
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Document corner cases, visual approaches, optimal data structures used..."
                  />
                ) : (
                  <div className="w-full min-h-[80px] p-4 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-normal whitespace-pre-line">
                    {problem.notes || "No personal notes logged for this problem yet. Click Edit to add some!"}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: AI Review & Actions (2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                  <BrainCircuit className="h-4 w-4 text-indigo-500" /> AI Review Details
                </h3>
                {!isEditing && (
                  <Button
                    onClick={handleReanalyze}
                    disabled={isAnalyzing}
                    variant="outline"
                    size="sm"
                    className="gap-1 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg cursor-pointer shrink-0 font-bold"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> 
                    {isAnalyzing ? "Analyzing..." : hasAiData ? "Re-Analyze" : "AI Review"}
                  </Button>
                )}
              </div>

              {/* Render AI card */}
              {isAnalyzing ? (
                <AiReviewCard data={{} as AiReviewData} isLoading={true} />
              ) : aiReviewObj ? (
                <AiReviewCard data={aiReviewObj} />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl text-center">
                  <BrainCircuit className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                  <h4 className="font-semibold text-sm text-slate-750 dark:text-slate-300">No Review Available</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4 max-w-[220px]">This code submission has not been processed by AI Mentor yet.</p>
                  <Button
                    onClick={handleReanalyze}
                    disabled={isAnalyzing}
                    size="sm"
                    className="gap-1.5 rounded-lg cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold border-0 hover:shadow-lg shadow-indigo-500/10"
                  >
                    <Sparkles className="h-4 w-4" /> Run AI Code Review
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center shrink-0 text-slate-400 text-xs">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Solved on: {new Date(problem.solvedAt).toLocaleDateString()}
          </span>
          {problem.timeTaken && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Solve Time: {problem.timeTaken} mins
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
