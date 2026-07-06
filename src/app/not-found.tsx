"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Page Not Found</h2>
        <p className="mt-2 text-slate-500">The page you are looking for does not exist or has been moved.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/">
            <Button><Home className="h-4 w-4" /> Go Home</Button>
          </Link>
          <Button variant="secondary" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
