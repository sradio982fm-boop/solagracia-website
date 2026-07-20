import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return errorResponse("Refresh token expired. Please login again.", 401);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    const response = errorResponse(
      "Refresh token expired. Please login again.",
      401,
    );
    clearAuthCookies(response);
    return response;
  }

  if (data.user.app_metadata?.role !== "admin") {
    const response = errorResponse("Forbidden", 403);
    clearAuthCookies(response);
    return response;
  }

  const response = jsonResponse({
    accessToken: data.session.access_token,
    expiresIn: data.session.expires_in,
  });

  setAuthCookies(response, data.session.refresh_token);
  return response;
}
