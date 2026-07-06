"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  LayoutDashboard, User, Code2, FolderKanban, Award, Brain,
  FileText, MessageSquare, Target, Trophy, Sparkles, LogOut,
  Menu, X, Bell, Flame, Coins, BarChart3, Settings, Send, Trash2, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/skills", label: "Skills", icon: Brain },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/certifications", label: "Certifications", icon: Award },
  { href: "/dsa", label: "DSA Tracker", icon: Code2 },
  { href: "/aptitude", label: "Aptitude", icon: Target },
  { href: "/interviews", label: "Mock Interviews", icon: MessageSquare },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/ai-mentor", label: "AI Mentor", icon: Sparkles },
  { href: "/weekly-goals", label: "Weekly Goals", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/achievements", label: "Achievements", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

const suggestionChips = [
  { text: "🎯 Weekly Study Plan", prompt: "Suggest a weekly study plan based on my profile." },
  { text: "💼 Prep Interview Qs", prompt: "Generate top technical interview questions for Software Engineer role." },
  { text: "🔍 Resume Audit Tips", prompt: "What are the key points to optimize in my resume to pass ATS?" },
  { text: "💡 Weak Area Tips", prompt: "Give me recommendations on how to improve my weakest skill areas." },
];

export function DashboardLayout({ children, user }: { children: React.ReactNode; user?: { name?: string; xp?: number; coins?: number; level?: number; codingStreak?: number } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mentorOpen, setMentorOpen] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat messages from localStorage on client side
  useEffect(() => {
    const saved = localStorage.getItem("skillforge_mentor_chat");
    if (saved) {
      try {
        setChatMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading chat messages:", e);
      }
    }
  }, []);

  // Save chat messages to localStorage when updated
  const saveChat = (messages: typeof chatMessages) => {
    localStorage.setItem("skillforge_mentor_chat", JSON.stringify(messages));
  };

  // Scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (mentorOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [mentorOpen, chatMessages, chatLoading]);

  // Listen to custom window events to toggle mentor side panel from pages
  useEffect(() => {
    const handleOpenMentor = () => setMentorOpen(true);
    window.addEventListener("open-ai-mentor", handleOpenMentor);
    return () => window.removeEventListener("open-ai-mentor", handleOpenMentor);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  // Send message function
  async function sendChatMessage(overrideMessage?: string) {
    const messageToSend = (overrideMessage || chatInput).trim();
    if (!messageToSend) return;

    if (!overrideMessage) {
      setChatInput("");
    }

    const updatedMessages = [...chatMessages, { role: "user" as const, text: messageToSend }];
    setChatMessages(updatedMessages);
    saveChat(updatedMessages);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await response.json();
      if (response.ok && data.reply) {
        const finalMessages = [...updatedMessages, { role: "assistant" as const, text: data.reply }];
        setChatMessages(finalMessages);
        saveChat(finalMessages);
      } else {
        const finalMessages = [...updatedMessages, { role: "assistant" as const, text: data.error || "Sorry, I could not respond at this time." }];
        setChatMessages(finalMessages);
        saveChat(finalMessages);
      }
    } catch (error) {
      const finalMessages = [...updatedMessages, { role: "assistant" as const, text: "Failed to connect to the AI Mentor service." }];
      setChatMessages(finalMessages);
      saveChat(finalMessages);
    } finally {
      setChatLoading(false);
    }
  }

  // Clear chat history
  const clearChatHistory = () => {
    if (confirm("Are you sure you want to clear your chat history with the AI Mentor?")) {
      setChatMessages([]);
      localStorage.removeItem("skillforge_mentor_chat");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Sidebar Backdrop (Mobile) */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      
      {/* Side Panel Backdrop (Mobile) */}
      {mentorOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMentorOpen(false)} />}

      {/* Left Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-slate-200 transition-transform lg:translate-x-0 lg:static flex flex-col h-screen shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">Skill<span className="text-indigo-600">Forge</span></span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={cn("h-4 w-4", active && "text-indigo-600")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 shrink-0">
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 lg:px-8 shrink-0">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-amber-600" title="Coding Streak"><Flame className="h-4 w-4" />{user.codingStreak || 0}</span>
                <span className="flex items-center gap-1 text-indigo-600" title="Level">Lv.{user.level || 1}</span>
                <span className="flex items-center gap-1 text-emerald-600" title="XP">{user.xp || 0} XP</span>
                <span className="flex items-center gap-1 text-amber-500" title="Coins"><Coins className="h-4 w-4" />{user.coins || 0}</span>
              </div>
            )}

            {/* Notifications Button */}
            <button className="relative p-2 rounded-lg hover:bg-slate-100"><Bell className="h-5 w-5 text-slate-600" /></button>

            {/* AI MENTOR TOGGLE BUTTON (Chrome Gemini style) */}
            <button 
              onClick={() => setMentorOpen(!mentorOpen)}
              className={cn(
                "relative p-2 rounded-lg transition-all duration-300",
                mentorOpen 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-105" 
                  : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
              )}
              title="AI Career Mentor"
            >
              <Sparkles className={cn("h-5 w-5", !mentorOpen && "animate-pulse text-indigo-600")} />
              {!mentorOpen && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              )}
            </button>

            {/* User Profile Avatar */}
            {user && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-bg text-white text-sm font-bold shadow-sm">
                {user.name?.charAt(0) || "S"}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>

      {/* Chrome-Style Gemini Side Panel (Right Sidebar) */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-[380px] sm:w-[450px] transform bg-white border-l border-slate-200 transition-transform duration-300 ease-in-out shadow-2xl flex flex-col h-screen shrink-0",
        mentorOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Panel Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 shrink-0 bg-slate-50/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <Sparkles className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                AI Career Mentor
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Online"></span>
              </h2>
              <p className="text-[10px] text-slate-500">Google Gemini Powered Coach</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {chatMessages.length > 0 && (
              <button 
                onClick={clearChatHistory}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button 
              onClick={() => setMentorOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Close Panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Panel Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 animate-bounce">
                <Brain className="h-6 w-6" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h3 className="font-semibold text-slate-800 text-sm">Ask your AI Mentor</h3>
                <p className="text-xs text-slate-500">
                  Get personalized feedback on your placements, skills improvement plans, resume optimization, and mock interview tips.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "self-end bg-indigo-600 text-white shadow-sm shadow-indigo-100"
                      : "self-start bg-white text-slate-800 border border-slate-200/60 shadow-sm"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-slate max-w-none text-xs leading-relaxed space-y-1.5 break-words">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          pre({ children }) { return <>{children}</>; },
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline ? (
                              <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg overflow-x-auto my-1.5 text-[11px] font-mono leading-normal border border-slate-800">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded text-[11px] font-mono" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                  )}
                </div>
              ))}
              
              {chatLoading && (
                <div className="self-start bg-white border border-slate-200/60 shadow-sm rounded-2xl px-4 py-3 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-1.5 shrink-0">
          {suggestionChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => sendChatMessage(chip.prompt)}
              disabled={chatLoading}
              className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-200 disabled:opacity-50 shrink-0"
            >
              {chip.text}
            </button>
          ))}
        </div>

        {/* Input Form Panel */}
        <div className="p-4 border-t border-slate-200 shrink-0 bg-white shadow-lg shadow-black/5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask the AI mentor a question..."
              disabled={chatLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendChatMessage();
                }
              }}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-75"
            />
            <button
              onClick={() => sendChatMessage()}
              disabled={chatLoading || !chatInput.trim()}
              className={cn(
                "absolute right-1.5 p-2 rounded-lg transition-all",
                chatInput.trim() && !chatLoading
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                  : "text-slate-400 bg-slate-100 cursor-not-allowed"
              )}
            >
              {chatLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 text-center">
            AI Mentor responses are suggestions based on your dashboard metrics.
          </p>
        </div>
      </aside>
    </div>
  );
}
