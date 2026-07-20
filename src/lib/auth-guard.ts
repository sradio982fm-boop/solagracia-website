import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { errorResponse } from "./api-helpers";
import {
  GATE_COOKIE,
  hasValidApiKeyHeader,
  isApiKeyConfigured,
  verifyApiGateToken,
} from "./api-security";

/**
 * Validates admin access:
 * 1. Bearer JWT must be a valid Supabase user with `app_metadata.role = admin`
 * 2. When `SG_API_KEY` is set: httpOnly gate cookie **or** `x-api-key` header
 */
export async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return { error: errorResponse("Unauthorized", 401) };
  }

  if (isApiKeyConfigured()) {
    const gateOk = await verifyApiGateToken(
      request.cookies.get(GATE_COOKIE)?.value,
    );
    const keyOk = hasValidApiKeyHeader(request);
    if (!gateOk && !keyOk) {
      return { error: errorResponse("Unauthorized — missing API gate", 401) };
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: errorResponse("Unauthorized", 401) };
  }

  if (user.app_metadata?.role !== "admin") {
    return { error: errorResponse("Forbidden", 403) };
  }

  return { user };
}
