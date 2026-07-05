"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#why-us", label: "Why Us" },
  { href: "#stats", label: "Statistics" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full glass border-b border-slate-200/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">Skill<span className="text-indigo-600">Forge</span></span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
          <Link href="/register"><Button size="sm">Get Started Free</Button></Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="block py-2 text-sm font-medium text-slate-600" onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login"><Button variant="outline" className="w-full">Login</Button></Link>
            <Link href="/register"><Button className="w-full">Get Started</Button></Link>
          </div>
        </div>
      )}
    </header>
  );
}
