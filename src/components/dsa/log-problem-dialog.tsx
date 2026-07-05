"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import CodeEditor from "./code-editor";
import AiReviewCard, { AiReviewData } from "./ai-review-card";
import { Sparkles, Save, X, BookOpen } from "lucide-react";
import { DSA_PLATFORMS, DSA_TOPICS } from "@/lib/constants";

interface LogProblemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function LogProblemDialog({
  isOpen,
  onClose,
  onRefresh,
}: LogProblemDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form states
  const [form, setForm] = useState({
    title: "",
    platform: "LeetCode",
    url: "",
    topic: "Arrays",
    difficulty: "EASY",
    language: "Java",
    timeTaken: 30,
    code: "",
    notes: "",
  });

  // AI Review state
  const [aiReport, setAiReport] = useState<AiReviewData | null>(null);

  const resetForm = () => {
    setForm({
      title: "",
      platform: "LeetCode",
      url: "",
      topic: "Arrays",
      difficulty: "EASY",
      language: "Java",
      timeTaken: 30,
      code: "",
      notes: "",
    });
    setAiReport(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Run AI analysis on current code draft
  const handleAnalyze = async () => {
    if (!form.title) {
      alert("Please enter a Problem Title before analyzing.");
      return;
    }
    if (!form.code) {
      alert("Please write some code in the editor to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setAiReport(null);
    try {
      const res = await fetch("/api/student/dsa/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          language: form.language,
          code: form.code,
          topic: form.topic,
          difficulty: form.difficulty,
        }),
      });

      if (!res.ok) {
        throw new Error("AI analysis service failed");
      }

      const data = await res.json();
      setAiReport(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze code. Please check your AI API configurations.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save problem submission
  const handleSave = async () => {
    if (!form.title) {
      alert("Problem Title is required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: form.title,
        platform: form.platform,
        url: form.url || null,
        topic: form.topic,
        difficulty: form.difficulty,
        language: form.language,
        timeTaken: Number(form.timeTaken),
        code: form.code || null,
        notes: form.notes || null,
        // If AI was already analyzed, save those values!
        ...(aiReport && {
          aiScore: aiReport.score,
          aiTimeComplexity: aiReport.timeComplexity,
          aiSpaceComplexity: aiReport.spaceComplexity,
          aiOptimal: aiReport.optimal,
          aiCodeQuality: aiReport.codeQuality,
          aiReadability: aiReport.readability,
          aiNaming: aiReport.naming,
          aiMemoryUsage: aiReport.memoryUsage,
          aiReadiness: aiReport.readiness,
          aiEdgeCases: aiReport.edgeCases,
          aiSuggestions: JSON.stringify(aiReport.suggestions),
        }),
      };

      const res = await fetch("/api/student/dsa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onRefresh();
        handleClose();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to log problem.");
      }
    } catch (err) {
      console.error(err);
      alert("Error logging problem.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <DialogContent maxWidth="5xl" onClose={handleClose} className="p-0 overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 flex items-center justify-between shrink-0">
          <div>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-indigo-650 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Log Problem Entry
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1">
              Add a new DSA problem and run AI assessments to optimize it.
            </DialogDescription>
          </div>
          <button 
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-5">
            
            {/* Left Column: Form & Editor (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Form Metadata Fields */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Problem Name *"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Two Sum"
                    required
                  />
                </div>
                <Select
                  label="Platform"
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  options={DSA_PLATFORMS.map((p) => ({ value: p, label: p }))}
                />
                
                <div className="sm:col-span-2">
                  <Input
                    label="Problem URL"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="e.g. https://leetcode.com/problems/two-sum"
                  />
                </div>
                <Select
                  label="Topic"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  options={DSA_TOPICS.map((t) => ({ value: t, label: t }))}
                />

                <Select
                  label="Difficulty"
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  options={[
                    { value: "EASY", label: "Easy" },
                    { value: "MEDIUM", label: "Medium" },
                    { value: "HARD", label: "Hard" },
                  ]}
                />
                <Select
                  label="Language"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  options={[
                    { value: "Java", label: "Java" },
                    { value: "Python", label: "Python" },
                    { value: "C++", label: "C++" },
                    { value: "JavaScript", label: "JavaScript" },
                  ]}
                />
                <Input
                  label="Time Taken (mins)"
                  type="number"
                  value={form.timeTaken}
                  onChange={(e) => setForm({ ...form, timeTaken: Number(e.target.value) })}
                  placeholder="30"
                />
              </div>

              {/* Code Editor */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                  Your Code Submission
                </label>
                <CodeEditor
                  value={form.code}
                  onChange={(val) => setForm({ ...form, code: val })}
                  language={form.language}
                  onLanguageChange={(lang) => setForm({ ...form, language: lang })}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  Personal Revision Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Document patterns, visualization tools, things to watch out for..."
                />
              </div>
            </div>

            {/* Right Column: AI Analysis Reports (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">AI Code Mentor Evaluation</h3>
                <Button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !form.code}
                  variant="outline"
                  size="sm"
                  className="gap-1 bg-indigo-50/50 hover:bg-indigo-50 border-indigo-150 text-indigo-650 hover:text-indigo-700 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/50 dark:border-indigo-900 rounded-lg cursor-pointer font-bold"
                >
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  {isAnalyzing ? "Analyzing..." : "AI Analyze"}
                </Button>
              </div>

              {/* AI result showcase */}
              {isAnalyzing ? (
                <AiReviewCard data={{} as AiReviewData} isLoading={true} />
              ) : aiReport ? (
                <AiReviewCard data={aiReport} />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center h-[280px]">
                  <Sparkles className="h-8 w-8 text-indigo-400 mb-2 animate-bounce" />
                  <h4 className="font-bold text-sm text-slate-750 dark:text-slate-350">On-the-Fly Analysis</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Write your solution, then click &quot;AI Analyze&quot; to receive complexity evaluation and code quality feedback before saving!</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-end gap-2 shrink-0">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isSaving}
            className="rounded-lg cursor-pointer"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !form.title}
            className="gap-1 rounded-lg cursor-pointer"
          >
            <Save className="h-4 w-4" /> Save Problem
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
