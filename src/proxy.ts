import { NextResponse, type NextRequest } from "next/server";
import { extractClientIp } from "@/lib/request-helpers";
import {
  GATE_COOKIE,
  hasValidApiKeyHeader,
  isApiKeyConfigured,
  isRateLimited,
  pruneRateBuckets,
  verifyApiGateToken,
} from "@/lib/api-security";
import { SESSION_COOKIE } from "@/lib/auth-cookies";

const LOGIN_WINDOW_MS = 60_000;
const LOGIN_MAX_ATTEMPTS = 5;
const AD_CLICK_WINDOW_MS = 60_000;
const AD_CLICK_MAX = 30;
const ADMIN_API_WINDOW_MS = 60_000;
const ADMIN_API_MAX = 120;
const PUBLIC_API_WINDOW_MS = 60_000;
const PUBLIC_API_MAX = 60;

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = extractClientIp(request);
  pruneRateBuckets();

  // --- Login brute-force throttle ---
  if (path === "/api/auth/login" && request.method === "POST") {
    if (isRateLimited(`login:${ip}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan. Coba lagi dalam 60 detik." },
        { status: 429 },
      );
    }
  }

  // --- Ad-click flood throttle ---
  if (path.startsWith("/api/public/ad-click")) {
    if (isRateLimited(`adclick:${ip}`, AD_CLICK_MAX, AD_CLICK_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // --- Generic public API throttle (now-playing / health) ---
  if (
    path.startsWith("/api/public/") &&
    !path.startsWith("/api/public/ad-click")
  ) {
    if (isRateLimited(`public:${ip}`, PUBLIC_API_MAX, PUBLIC_API_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // --- Admin pages: session cookie gate ---
  if (isProtectedAdminPage(path)) {
    const session = request.cookies.get(SESSION_COOKIE)?.value;
    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("next", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Admin API: Bearer + (gate cookie | x-api-key) ---
  if (path.startsWith("/api/admin")) {
    if (isRateLimited(`admin-api:${ip}`, ADMIN_API_MAX, ADMIN_API_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isApiKeyConfigured()) {
      const gateOk = await verifyApiGateToken(
        request.cookies.get(GATE_COOKIE)?.value,
      );
      const keyOk = hasValidApiKeyHeader(request);
      if (!gateOk && !keyOk) {
        return NextResponse.json(
          { error: "Unauthorized — missing API gate" },
          { status: 401 },
        );
      }
    }
  }

  const response = NextResponse.next();
  applyApiSecurityHeaders(response, path);
  return response;
}

function isProtectedAdminPage(path: string): boolean {
  if (!path.startsWith("/admin")) return false;
  if (path === "/admin/login" || path.startsWith("/admin/login/")) return false;
  return true;
}

function applyApiSecurityHeaders(response: NextResponse, path: string): void {
  if (!path.startsWith("/api/")) return;
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
