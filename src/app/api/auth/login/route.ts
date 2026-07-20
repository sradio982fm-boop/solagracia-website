import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { setAuthCookies } from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return errorResponse("Email and password are required", 400);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error || !data.session || !data.user) {
    return errorResponse("Invalid credentials", 401);
  }

  if (data.user.app_metadata?.role !== "admin") {
    await supabase.auth.signOut();
    return errorResponse("Forbidden", 403);
  }

  const response = jsonResponse(
    {
      accessToken: data.session.access_token,
      expiresIn: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: "admin",
      },
    },
    200,
  );

  setAuthCookies(response, data.session.refresh_token);
  return response;
}
