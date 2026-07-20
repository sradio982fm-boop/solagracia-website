import { NextResponse, type NextRequest } from "next/server";
import { extractClientIp } from "@/lib/request-helpers";

// Best-effort in-memory throttle. Prefer edge firewall / Redis in production.
const LOGIN_RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();
const LOGIN_WINDOW_MS = 60_000;
const LOGIN_MAX_ATTEMPTS = 5;

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === "/api/auth/login" && request.method === "POST") {
    if (isLoginRateLimited(request)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Coba lagi dalam 60 detik." },
        { status: 429 },
      );
    }
  }

  if (isProtectedAdminPage(path)) {
    // sg_session is path=/ — sg_refresh stays scoped to /api/auth only
    const session = request.cookies.get("sg_session")?.value;
    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (path.startsWith("/api/admin")) {
    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

function isProtectedAdminPage(path: string): boolean {
  if (!path.startsWith("/admin")) return false;
  if (path === "/admin/login" || path.startsWith("/admin/login/")) return false;
  return true;
}

function isLoginRateLimited(request: NextRequest): boolean {
  const ip = extractClientIp(request);
  const now = Date.now();
  const entry = LOGIN_RATE_LIMIT.get(ip);

  if (!entry || now > entry.resetAt) {
    LOGIN_RATE_LIMIT.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > LOGIN_MAX_ATTEMPTS;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
