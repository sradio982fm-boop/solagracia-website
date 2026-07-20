import type { NextResponse } from "next/server";

/** Refresh token — only sent to auth API routes. */
export const REFRESH_COOKIE = "sg_refresh";
/** Session flag for proxy gate on /admin pages (no secret). */
export const SESSION_COOKIE = "sg_session";

const REFRESH_PATH = "/api/auth";
const SESSION_PATH = "/";
const MAX_AGE = 7 * 24 * 60 * 60;

function cookieBase() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: MAX_AGE,
  };
}

export function setAuthCookies(
  response: NextResponse,
  refreshToken: string,
): void {
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    ...cookieBase(),
    path: REFRESH_PATH,
  });
  response.cookies.set(SESSION_COOKIE, "1", {
    ...cookieBase(),
    path: SESSION_PATH,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: REFRESH_PATH,
    maxAge: 0,
  });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: SESSION_PATH,
    maxAge: 0,
  });
}
