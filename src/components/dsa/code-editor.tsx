"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Copy, 
  Check, 
  Download, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-[350px] bg-slate-900 border border-slate-800 rounded-xl">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      <span className="mt-2 text-xs text-slate-400">Loading Monaco Editor...</span>
    </div>
  ),
});

const DEFAULT_TEMPLATES: Record<string, string> = {
  java: `public class Solution {
    public static void main(String[] args) {
        // Write your Java solution here
        System.out.println("Hello SkillForge!");
    }
}`,
  python: `def solve():
    # Write your Python solution here
    print("Hello SkillForge!")

if __name__ == "__main__":
    solve()`,
  cpp: `#include <iostream>
using namespace std;

void solve() {
    // Write your C++ solution here
    cout << "Hello SkillForge!" << endl;
}

int main() {
    solve();
    return 0;
}`,
  javascript: `function solve() {
    // Write your JavaScript solution here
    console.log("Hello SkillForge!");
}

solve();`,
};

const FILE_EXTENSIONS: Record<string, string> = {
  java: "java",
  python: "py",
  cpp: "cpp",
  javascript: "js",
};

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange?: (language: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  readOnly = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Normalize language for Monaco (Monaco uses cpp, python, java, javascript)
  const normalizedLanguage = language.toLowerCase() === "c++" ? "cpp" : language.toLowerCase();

  // Reset editor template
  const handleReset = () => {
    if (readOnly) return;
    const template = DEFAULT_TEMPLATES[normalizedLanguage] || "";
    onChange(template);
  };

  // Copy code to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  // Download code file
  const handleDownload = () => {
    const ext = FILE_EXTENSIONS[normalizedLanguage] || "txt";
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `solution.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Automatically load template if value is empty and not read-only
  useEffect(() => {
    if (!value && !readOnly) {
      const template = DEFAULT_TEMPLATES[normalizedLanguage] || "";
      onChange(template);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedLanguage, readOnly]);

  const editorLayout = (
    <div className={`flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-900 shadow-md ${isFullscreen ? "fixed inset-0 z-[100] h-screen w-screen rounded-none" : "h-[450px]"}`}>
      {/* Editor Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-slate-300">
        <div className="flex items-center gap-3">
          <Code2 className="h-4 w-4 text-indigo-500" />
          {onLanguageChange && !readOnly ? (
            <select
              value={normalizedLanguage}
              onChange={(e) => {
                const selected = e.target.value;
                const origLang = selected === "cpp" ? "C++" : selected.charAt(0).toUpperCase() + selected.slice(1);
                onLanguageChange(origLang);
              }}
              className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="javascript">JavaScript</option>
            </select>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              {language}
            </span>
          )}
          {readOnly && (
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
              READ-ONLY
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
            title="Download Code"
          >
            <Download className="h-4 w-4" />
          </Button>

          {!readOnly && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Reset Code Template"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full bg-slate-900 relative">
        <Editor
          height="100%"
          language={normalizedLanguage}
          theme={isDark ? "vs-dark" : "light"}
          value={value}
          onChange={(val) => !readOnly && onChange(val || "")}
          options={{
            readOnly,
            fontSize: 14,
            minimap: { enabled: !isFullscreen },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: "on",
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
            },
            fontFamily: "var(--font-mono, Courier New), Courier, monospace",
          }}
        />
      </div>
    </div>
  );

  return editorLayout;
}
