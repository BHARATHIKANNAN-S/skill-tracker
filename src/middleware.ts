import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";

const publicPaths = ["/", "/login", "/register", "/forgot-password", "/verify-otp"];
const adminPaths = ["/admin"];
const studentPaths = ["/dashboard", "/profile", "/skills", "/projects", "/certifications", "/dsa", "/aptitude", "/interviews", "/resume", "/ai-mentor", "/weekly-goals", "/leaderboard", "/achievements", "/settings", "/notifications"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;
  const session = token ? await verifyTokenEdge(token) : null;

  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith("/api/auth"));
  const isProtectedApi = pathname.startsWith("/api/student") || pathname.startsWith("/api/admin") || pathname.startsWith("/api/chat");
  const isApi = pathname.startsWith("/api");

  if (isPublic || (isApi && !isProtectedApi)) {
    if (session && (pathname === "/login" || pathname === "/register")) {
      const redirect = session.role === "STUDENT" ? "/dashboard" : "/admin";
      return NextResponse.redirect(new URL(redirect, request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (adminPaths.some((p) => pathname.startsWith(p)) && session.role === "STUDENT") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (studentPaths.some((p) => pathname.startsWith(p)) && session.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
