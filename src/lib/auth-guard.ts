import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { errorResponse } from "./api-helpers";

/**
 * Validates the request has a valid admin JWT.
 */
export async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return { error: errorResponse("Unauthorized", 401) };
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
