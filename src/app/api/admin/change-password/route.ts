import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { strongPasswordSchema } from "@/lib/schemas/password";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "oldPassword is required").max(128),
  newPassword: strongPasswordSchema,
});

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return errorResponse("Unauthorized", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400);
  }
  const { oldPassword, newPassword } = parsed.data;

  if (oldPassword === newPassword) {
    return errorResponse("Password baru harus berbeda dari yang lama", 400);
  }

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();
  if (authError || !user) {
    return errorResponse("Unauthorized", 401);
  }

  if (user.app_metadata?.role !== "admin") {
    return errorResponse("Forbidden", 403);
  }

  const verifyClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error: signInError } = await verifyClient.auth.signInWithPassword({
    email: user.email!,
    password: oldPassword,
  });

  if (signInError) {
    return errorResponse("Password lama salah", 400);
  }

  const adminClient = createSupabaseAdmin();
  const { error } = await adminClient.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (error) {
    return errorResponse(error.message || "Gagal mengubah password", 500);
  }

  return jsonResponse({ success: true, message: "Password berhasil diubah" });
}
