import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

const timeValue = z
  .number()
  .min(0)
  .max(24)
  .refine((v) => Math.abs(v % 0.25) < 0.001, {
    message: "Waktu harus kelipatan 15 menit",
  });

const createScheduleSchema = z
  .object({
    showId: z.string().uuid(),
    dayOfWeek: z.number().int().min(0).max(6),
    startHour: timeValue,
    endHour: timeValue,
    sortOrder: z.number().int().min(0).optional().default(0),
  })
  .refine((data) => data.endHour !== data.startHour, {
    message: "Jam selesai harus berbeda dari jam mulai",
  });

const updateScheduleSchema = z
  .object({
    id: z.string().uuid(),
    showId: z.string().uuid().optional(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startHour: timeValue.optional(),
    endHour: timeValue.optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine(
    (data) =>
      data.startHour === undefined ||
      data.endHour === undefined ||
      data.endHour !== data.startHour,
    { message: "Jam selesai harus berbeda dari jam mulai" },
  );

function mapEntry(e: Record<string, unknown>) {
  const showRaw = e.show as unknown;
  const show = (Array.isArray(showRaw) ? showRaw[0] : showRaw) as
    | { id: string; title: string; host: unknown }
    | null
    | undefined;
  const hostRaw = show?.host;
  const host = (Array.isArray(hostRaw) ? hostRaw[0] : hostRaw) as
    | { id: string; name: string; photo_url: string }
    | null
    | undefined;

  return {
    id: e.id,
    dayOfWeek: e.day_of_week,
    startHour: e.start_hour,
    endHour: e.end_hour,
    sortOrder: e.sort_order,
    show: show
      ? {
          id: show.id,
          title: show.title,
          host: host
            ? { id: host.id, name: host.name, photoUrl: host.photo_url }
            : null,
        }
      : null,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  };
}

/** Expand overnight windows (22→02) into comparable ranges on a 0–48 line. */
function ranges(
  startHour: number,
  endHour: number,
): Array<{ start: number; end: number }> {
  if (endHour > startHour) return [{ start: startHour, end: endHour }];
  return [
    { start: startHour, end: 24 },
    { start: 0, end: endHour },
  ];
}

function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  const a = ranges(aStart, aEnd);
  const b = ranges(bStart, bEnd);
  return a.some((ra) =>
    b.some((rb) => ra.start < rb.end && ra.end > rb.start),
  );
}

function hasOverlap(
  slots: { id: string; start_hour: number; end_hour: number }[],
  startHour: number,
  endHour: number,
  excludeId?: string,
): boolean {
  return slots.some(
    (slot) =>
      slot.id !== excludeId &&
      rangesOverlap(startHour, endHour, slot.start_hour, slot.end_hour),
  );
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();
  const day = request.nextUrl.searchParams.get("day");

  let query = supabase
    .from("schedule_slots")
    .select(
      `
      id, day_of_week, start_hour, end_hour, sort_order, created_at, updated_at,
      show:shows (
        id, title,
        host:hosts ( id, name, photo_url )
      )
    `,
    )
    .order("day_of_week")
    .order("start_hour")
    .order("sort_order");

  if (day !== null && day !== "") {
    query = query.eq("day_of_week", Number(day));
  }

  const { data, error } = await query;

  if (error) return errorResponse("Failed to fetch schedule", 500);

  return jsonResponse({ entries: (data || []).map((e) => mapEntry(e)) });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = createScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();
  const { showId, dayOfWeek, startHour, endHour, sortOrder } = parsed.data;

  const { data: existing } = await supabase
    .from("schedule_slots")
    .select("id, start_hour, end_hour")
    .eq("day_of_week", dayOfWeek);

  if (hasOverlap(existing || [], startHour, endHour)) {
    return errorResponse("Slot jadwal bertabrakan dengan slot yang sudah ada", 409);
  }

  const { data, error } = await supabase
    .from("schedule_slots")
    .insert({
      show_id: showId,
      day_of_week: dayOfWeek,
      start_hour: startHour,
      end_hour: endHour,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return errorResponse("Slot pada jam ini sudah ada", 409);
    }
    if (error.code === "23514") {
      return errorResponse("Jam mulai / selesai di luar rentang yang diizinkan", 400);
    }
    return errorResponse("Failed to create schedule slot", 500);
  }

  revalidatePath("/");
  return jsonResponse({ id: data.id }, 201);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = updateScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();

  const { data: current, error: fetchError } = await supabase
    .from("schedule_slots")
    .select("day_of_week, start_hour, end_hour")
    .eq("id", parsed.data.id)
    .single();

  if (fetchError || !current) {
    return errorResponse("Schedule slot not found", 404);
  }

  const dayOfWeek = parsed.data.dayOfWeek ?? current.day_of_week;
  const startHour = parsed.data.startHour ?? current.start_hour;
  const endHour = parsed.data.endHour ?? current.end_hour;

  if (endHour <= startHour) {
    return errorResponse("Jam selesai harus lebih besar dari jam mulai", 400);
  }

  const { data: existing } = await supabase
    .from("schedule_slots")
    .select("id, start_hour, end_hour")
    .eq("day_of_week", dayOfWeek);

  if (hasOverlap(existing || [], startHour, endHour, parsed.data.id)) {
    return errorResponse("Slot jadwal bertabrakan dengan slot yang sudah ada", 409);
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.showId !== undefined) updates.show_id = parsed.data.showId;
  if (parsed.data.dayOfWeek !== undefined) {
    updates.day_of_week = parsed.data.dayOfWeek;
  }
  if (parsed.data.startHour !== undefined) updates.start_hour = parsed.data.startHour;
  if (parsed.data.endHour !== undefined) updates.end_hour = parsed.data.endHour;
  if (parsed.data.sortOrder !== undefined) updates.sort_order = parsed.data.sortOrder;

  const { error } = await supabase
    .from("schedule_slots")
    .update(updates)
    .eq("id", parsed.data.id);

  if (error) {
    if (error.code === "23505") {
      return errorResponse("Slot pada jam ini sudah ada", 409);
    }
    if (error.code === "23514") {
      return errorResponse("Jam mulai / selesai di luar rentang yang diizinkan", 400);
    }
    return errorResponse("Failed to update schedule slot", 500);
  }

  revalidatePath("/");
  return jsonResponse({ updated: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return errorResponse("id is required", 400);

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("schedule_slots").delete().eq("id", id);

  if (error) return errorResponse("Failed to delete schedule slot", 500);

  revalidatePath("/");
  return jsonResponse({ deleted: true });
}
