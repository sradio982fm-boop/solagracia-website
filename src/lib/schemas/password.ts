import { z } from "zod";

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

// Reject the top-N most common passwords. Not a full dictionary, but blocks
// the ones that appear in every breach corpus.
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "qwertyuiop",
  "admin1234",
  "admin12345",
  "welcome123",
  "letmein123",
  "iloveyou1",
  "sradio12345",
  "sradio982fm",
  "solagracia",
]);

export const strongPasswordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password minimal ${MIN_PASSWORD_LENGTH} karakter`)
  .max(
    MAX_PASSWORD_LENGTH,
    `Password terlalu panjang (max ${MAX_PASSWORD_LENGTH})`,
  )
  .refine((v) => /[a-z]/.test(v), "Harus mengandung huruf kecil")
  .refine((v) => /[A-Z]/.test(v), "Harus mengandung huruf besar")
  .refine((v) => /\d/.test(v), "Harus mengandung angka")
  .refine((v) => /[^A-Za-z0-9]/.test(v), "Harus mengandung karakter khusus")
  .refine(
    (v) => !COMMON_PASSWORDS.has(v.toLowerCase()),
    "Password terlalu umum",
  );

export const passwordRequirementsText = `Minimal ${MIN_PASSWORD_LENGTH} karakter, kombinasi huruf besar, huruf kecil, angka, dan karakter khusus.`;
