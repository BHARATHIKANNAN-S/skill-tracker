import {
  Brain, BarChart3, Target, Code2, FileText, MessageSquare,
  Award, Zap, Shield, LineChart,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  { icon: Brain, title: "AI Career Mentor", desc: "Personalized study plans, skill recommendations, and interview question generation powered by intelligent analysis.", color: "text-purple-600 bg-purple-100" },
  { icon: Code2, title: "DSA Tracker", desc: "Track problems across LeetCode, GFG, CodeChef with topic-wise analytics and streak rewards.", color: "text-indigo-600 bg-indigo-100" },
  { icon: BarChart3, title: "Placement Prediction", desc: "AI-calculated placement probability based on resume, skills, projects, DSA, and interview scores.", color: "text-cyan-600 bg-cyan-100" },
  { icon: FileText, title: "Resume Analyzer", desc: "ATS score, grammar check, keyword optimization, and version comparison for industry readiness.", color: "text-emerald-600 bg-emerald-100" },
  { icon: Target, title: "Aptitude Tracker", desc: "Track logical reasoning, quant, verbal ability with weak area identification and improvement graphs.", color: "text-amber-600 bg-amber-100" },
  { icon: MessageSquare, title: "Mock Interviews", desc: "Technical & HR mock interviews with detailed scoring, feedback, and improvement suggestions.", color: "text-rose-600 bg-rose-100" },
  { icon: Award, title: "Gamification", desc: "Earn XP, coins, badges, and achievements. Compete on leaderboards and maintain coding streaks.", color: "text-orange-600 bg-orange-100" },
  { icon: LineChart, title: "Analytics Dashboard", desc: "Beautiful charts, radar graphs, heat maps, and progress reports for data-driven career growth.", color: "text-blue-600 bg-blue-100" },
  { icon: Shield, title: "Enterprise Security", desc: "JWT authentication, role-based access, OTP verification, and secure file uploads.", color: "text-slate-600 bg-slate-100" },
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Features</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Everything You Need to Get Placed</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            A comprehensive platform that tracks every aspect of your placement preparation journey.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} hover className="group">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color} mb-4 transition-transform group-hover:scale-110`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  const reasons = [
    { title: "AI-First Approach", desc: "Unlike traditional CRUD apps, SkillForge continuously analyzes your data and provides intelligent, actionable recommendations." },
    { title: "Holistic Tracking", desc: "From DSA to aptitude, resume to mock interviews — every placement dimension is tracked and scored." },
    { title: "Institution Ready", desc: "Built for colleges and training institutes with admin panels, analytics, and bulk student management." },
    { title: "Motivation Engine", desc: "Gamification with XP, badges, streaks, and leaderboards keeps students engaged and consistent." },
  ];

  return (
    <section id="why-us" className="py-20 bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Why Choose Us</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Not Just Another Tracker — Your AI Placement Coach</h2>
            <p className="mt-4 text-slate-400 text-lg">
              SkillForge combines the best of LeetCode analytics, LinkedIn Learning paths, and personalized career coaching into one platform.
            </p>
          </div>
          <div className="space-y-6">
            {reasons.map((r, i) => (
              <div key={r.title} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-bg text-white font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{r.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Stats() {
  const stats = [
    { value: "50,000+", label: "Students Trained" },
    { value: "92%", label: "Placement Rate" },
    { value: "200+", label: "Partner Colleges" },
    { value: "15L+", label: "DSA Problems Solved" },
    { value: "10,000+", label: "Mock Interviews" },
    { value: "4.9/5", label: "Student Rating" },
  ];

  return (
    <section id="stats" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold gradient-text">{s.value}</p>
              <p className="mt-1 text-sm text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CompanyLogos() {
  const companies = ["Google", "Microsoft", "Amazon", "TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "HCL", "Capgemini", "Deloitte", "IBM"];
  return (
    <section className="py-16 border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-sm font-medium text-slate-500 mb-8">Our students are placed at top companies</p>
        <div className="flex flex-wrap justify-center gap-8 items-center">
          {companies.map((c) => (
            <span key={c} className="text-lg font-semibold text-slate-400 hover:text-indigo-600 transition-colors cursor-default">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const stories = [
    { name: "Priya Sharma", role: "Placed at Google", college: "IIT Delhi", quote: "SkillForge's AI mentor identified my weak areas in DP and helped me improve my placement score from 45% to 88% in 3 months.", avatar: "PS" },
    { name: "Rahul Verma", role: "Placed at Microsoft", college: "NIT Trichy", quote: "The DSA tracker and mock interview module were game-changers. I solved 200+ problems and attended 15 mock interviews before my actual placement.", avatar: "RV" },
    { name: "Ananya Patel", role: "Placed at Amazon", college: "VIT Vellore", quote: "Resume analyzer helped me optimize my CV for ATS. The placement prediction feature kept me motivated throughout my preparation journey.", avatar: "AP" },
  ];

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Success Stories</span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Students Love SkillForge</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {stories.map((s) => (
            <Card key={s.name} hover>
              <p className="text-slate-600 italic leading-relaxed">&ldquo;{s.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-bg text-white text-sm font-bold">
                  {s.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  <p className="text-xs text-indigo-600">{s.role}</p>
                  <p className="text-xs text-slate-500">{s.college}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const faqs = [
    { q: "Is SkillForge free for students?", a: "Yes! Students get free access to core features. Colleges can opt for premium institutional plans with advanced analytics." },
    { q: "How does AI placement prediction work?", a: "Our algorithm analyzes your resume, skills, projects, DSA progress, aptitude scores, interview performance, and consistency to calculate your placement readiness percentage." },
    { q: "Can colleges manage multiple students?", a: "Absolutely. Our admin panel allows bulk student management, certificate approval, placement drive management, and department-wise analytics." },
    { q: "Which coding platforms are supported?", a: "We support LeetCode, GeeksforGeeks, CodeChef, Codeforces, and HackerRank for DSA problem tracking." },
    { q: "Is my data secure?", a: "Yes. We use JWT authentication, bcrypt password encryption, OTP verification, role-based access control, and secure file uploads." },
  ];

  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-slate-200 bg-white p-5">
              <summary className="cursor-pointer font-semibold text-slate-900 list-none flex justify-between items-center">
                {f.q}
                <Zap className="h-4 w-4 text-indigo-500 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" className="py-20 bg-indigo-600">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold text-white">Ready to Transform Your Placement Journey?</h2>
        <p className="mt-4 text-indigo-100 text-lg">Join thousands of students already using SkillForge to land their dream jobs.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="/register" className="inline-flex h-12 items-center rounded-xl bg-white px-8 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
            Create Free Account
          </a>
          <a href="mailto:contact@skillforge.com" className="inline-flex h-12 items-center rounded-xl border-2 border-white/30 px-8 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
            Contact Sales
          </a>
        </div>
        <p className="mt-6 text-sm text-indigo-200">contact@skillforge.com | +91 98765 43210</p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-slate-900">Skill<span className="text-indigo-600">Forge</span></p>
            <p className="mt-2 text-sm text-slate-500">AI-powered placement readiness platform for students and institutions.</p>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Integrations", "API"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security", "GDPR"] },
          ].map((col) => (
            <div key={col.title}>
              <p className="font-semibold text-slate-900 mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-slate-500 hover:text-indigo-600">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          &copy; 2026 SkillForge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
