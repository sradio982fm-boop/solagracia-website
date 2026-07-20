import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { clearAuthCookies } from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return errorResponse("Unauthorized", 401);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  await supabase.auth.admin.signOut(token, "global");

  const response = jsonResponse({ success: true });
  clearAuthCookies(response);
  return response;
}
