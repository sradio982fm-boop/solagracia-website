import type { NextResponse } from "next/server";
import { GATE_COOKIE, createApiGateToken } from "@/lib/api-security";

/** Refresh token — only sent to auth API routes. */
export const REFRESH_COOKIE = "sg_refresh";
/** Session flag for proxy gate on /admin pages. */
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

export async function setAuthCookies(
  response: NextResponse,
  refreshToken: string,
  userId: string,
): Promise<void> {
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    ...cookieBase(),
    path: REFRESH_PATH,
  });
  response.cookies.set(SESSION_COOKIE, "1", {
    ...cookieBase(),
    path: SESSION_PATH,
  });

  const gate = await createApiGateToken(userId);
  if (gate) {
    response.cookies.set(GATE_COOKIE, gate, {
      ...cookieBase(),
      path: SESSION_PATH,
    });
  }
}

export function clearAuthCookies(response: NextResponse): void {
  const clear = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
  };

  response.cookies.set(REFRESH_COOKIE, "", { ...clear, path: REFRESH_PATH });
  response.cookies.set(SESSION_COOKIE, "", { ...clear, path: SESSION_PATH });
  response.cookies.set(GATE_COOKIE, "", { ...clear, path: SESSION_PATH });
}
