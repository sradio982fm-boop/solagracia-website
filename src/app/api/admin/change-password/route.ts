import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { strongPasswordSchema } from "@/lib/schemas/password";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "oldPassword is required").max(128),
  newPassword: strongPasswordSchema,
});

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400);
  }
  const { oldPassword, newPassword } = parsed.data;

  if (oldPassword === newPassword) {
    return errorResponse("Password baru harus berbeda dari yang lama", 400);
  }

  const user = auth.user;
  if (!user.email) {
    return errorResponse("User email missing", 400);
  }

  const verifyClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error: signInError } = await verifyClient.auth.signInWithPassword({
    email: user.email,
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
