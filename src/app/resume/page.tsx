"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText } from "lucide-react";

interface ResumeDetails {
  id: string;
  fileName: string;
  version: number;
  atsScore: number;
  grammarScore: number;
  formattingScore: number;
  keywordScore: number;
  industryReady: number;
  missingSkills?: string | null;
  suggestions?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function ResumePage() {
  const [resumes, setResumes] = useState<ResumeDetails[]>([]);
  const [fileName, setFileName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  function load() {
    fetch("/api/student/resume")
      .then((r) => r.json())
      .then((d) => setResumes(d.resumes || []))
      .catch((err) => console.error("Error loading resumes:", err));
  }
  
  useEffect(() => {
    load();
  }, []);

  async function analyze() {
    if (!fileName.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/student/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: fileName.trim() }),
      });
      if (res.ok) {
        setFileName("");
        load();
      }
    } catch (err) {
      console.error("Failed to analyze resume:", err);
    } finally {
      setAnalyzing(false);
    }
  }

  const active = resumes.find((r) => r.isActive);

  // Safe parsing utilities
  let parsedMissingSkills: string[] = [];
  let parsedSuggestions: string[] = [];

  if (active) {
    try {
      parsedMissingSkills = active.missingSkills ? JSON.parse(active.missingSkills) : [];
      if (!Array.isArray(parsedMissingSkills)) parsedMissingSkills = [];
    } catch (e) {
      parsedMissingSkills = [];
    }

    try {
      parsedSuggestions = active.suggestions ? JSON.parse(active.suggestions) : [];
      if (!Array.isArray(parsedSuggestions)) parsedSuggestions = [];
    } catch (e) {
      parsedSuggestions = [];
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Resume Analyzer</h1>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload Resume</CardTitle>
          </CardHeader>
          <div className="flex gap-4">
            <Input 
              placeholder="e.g. John_Doe_Resume.pdf" 
              value={fileName} 
              onChange={(e) => setFileName(e.target.value)} 
              className="flex-1" 
            />
            <div className="flex items-end">
              <Button onClick={analyze} disabled={analyzing} className="cursor-pointer">
                {analyzing ? "Analyzing..." : "Analyze Resume"}
              </Button>
            </div>
          </div>
        </Card>

        {active && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> {active.fileName}</CardTitle>
                <div className="pt-2">
                  <Badge variant="success">Version {active.version} • Active</Badge>
                </div>
              </CardHeader>
              <div className="space-y-3 pt-2">
                <ProgressBar value={active.atsScore} label="ATS Score" color="bg-indigo-600" />
                <ProgressBar value={active.grammarScore} label="Grammar Score" color="bg-emerald-500" />
                <ProgressBar value={active.formattingScore} label="Formatting Score" color="bg-amber-500" />
                <ProgressBar value={active.keywordScore} label="Keyword Score" color="bg-purple-500" />
                <ProgressBar value={active.industryReady} label="Industry Readiness" color="bg-cyan-500" />
              </div>
            </Card>
            
            <Card className="p-6">
              <CardHeader className="p-0 pb-4"><CardTitle>AI Suggestions</CardTitle></CardHeader>
              {parsedMissingSkills.length > 0 && (
                <div className="mb-4 pt-2">
                  <p className="text-sm font-medium text-slate-700 mb-2">Missing Skills:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedMissingSkills.map((s: string) => (
                      <Badge key={s} variant="danger">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {parsedSuggestions.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-medium text-slate-700 mb-2">Suggestions List:</p>
                  <ul className="space-y-2">
                    {parsedSuggestions.map((s: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {parsedMissingSkills.length === 0 && parsedSuggestions.length === 0 && (
                <p className="text-sm text-slate-400">No suggestions or missing skills reported.</p>
              )}
            </Card>
          </div>
        )}

        {resumes.length > 1 && (
          <Card className="p-6">
            <CardHeader className="p-0 pb-4"><CardTitle>Version Comparison</CardTitle></CardHeader>
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3">Version</th>
                    <th className="text-left py-2 px-3">File</th>
                    <th className="text-center py-2 px-3">ATS</th>
                    <th className="text-center py-2 px-3">Grammar</th>
                    <th className="text-center py-2 px-3">Keywords</th>
                    <th className="text-center py-2 px-3">Industry</th>
                  </tr>
                </thead>
                <tbody>
                  {resumes.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="py-2 px-3">v{r.version}</td>
                      <td className="py-2 px-3">{r.fileName}</td>
                      <td className="text-center py-2 px-3">{r.atsScore}%</td>
                      <td className="text-center py-2 px-3">{r.grammarScore}%</td>
                      <td className="text-center py-2 px-3">{r.keywordScore}%</td>
                      <td className="text-center py-2 px-3">{r.industryReady}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
