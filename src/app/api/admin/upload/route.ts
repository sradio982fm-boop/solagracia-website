import { NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const VALID_BUCKETS = ["hosts", "shows", "partners", "ads", "site"];

const IMAGE_SIGNATURES: Array<{
  ext: "jpg" | "png" | "webp";
  mime: string;
  match: (bytes: Uint8Array) => boolean;
}> = [
  {
    ext: "jpg",
    mime: "image/jpeg",
    match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: "png",
    mime: "image/png",
    match: (b) =>
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    ext: "webp",
    mime: "image/webp",
    match: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

function detectImageFormat(bytes: Uint8Array) {
  return IMAGE_SIGNATURES.find((sig) => sig.match(bytes)) ?? null;
}

const UNSAFE_FILENAME_CHARS = /[^a-zA-Z0-9._-]/g;

function normalizeSubpath(subpath: string | null): string {
  if (!subpath) return "";
  return subpath
    .replace(/\.\./g, "")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((seg) => seg.replace(UNSAFE_FILENAME_CHARS, ""))
    .filter(Boolean)
    .join("/");
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const formData = await request.formData().catch(() => null);
  if (!formData) return errorResponse("Invalid form data", 400);

  const file = formData.get("file") as File | null;
  const bucket = formData.get("bucket") as string | null;
  const subpath = formData.get("path") as string | null;

  if (!file) return errorResponse("No file provided", 400);
  if (!bucket || !VALID_BUCKETS.includes(bucket)) {
    return errorResponse("Invalid bucket. Use: " + VALID_BUCKETS.join(", "), 400);
  }
  if (file.size > MAX_FILE_SIZE) {
    return errorResponse("File too large. Maximum 5MB.", 413);
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const format = detectImageFormat(bytes);
  if (!format) {
    return errorResponse(
      "File is not a valid image. Allowed: jpg, png, webp",
      400,
    );
  }

  const timestamp = Date.now();
  const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const fileName = `${baseName}-${timestamp}.${format.ext}`;
  const safeSubpath = normalizeSubpath(subpath);
  const filePath = safeSubpath ? `${safeSubpath}/${fileName}` : fileName;

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
    contentType: format.mime,
    upsert: false,
  });

  if (error) return errorResponse("Upload failed: " + error.message, 500);

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return jsonResponse(
    {
      url: publicUrl.publicUrl,
      path: `${bucket}/${filePath}`,
      size: file.size,
    },
    201,
  );
}
