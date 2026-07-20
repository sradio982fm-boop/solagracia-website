import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return errorResponse("Unauthorized", 401);
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
    return errorResponse("Unauthorized", 401);
  }

  if (user.app_metadata?.role !== "admin") {
    return errorResponse("Forbidden", 403);
  }

  return jsonResponse({
    id: user.id,
    email: user.email,
    role: "admin",
    lastSignIn: user.last_sign_in_at,
  });
}
