"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";
import { toast } from "sonner";

export type ScheduleHost = {
  id: string;
  name: string;
  photoUrl: string;
};

export type ScheduleShow = {
  id: string;
  title: string;
  host: ScheduleHost | null;
};

export type ScheduleEntry = {
  id: string;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  sortOrder: number;
  show: ScheduleShow | null;
  createdAt: string;
  updatedAt: string;
};

export function useSchedule(day?: number) {
  return useQuery({
    queryKey: ["admin", "schedule", day],
    queryFn: () =>
      adminFetch<{ entries: ScheduleEntry[] }>("/admin/schedule", {
        params: day !== undefined ? { day } : undefined,
      }),
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      showId: string;
      dayOfWeek: number;
      startHour: number;
      endHour: number;
      sortOrder?: number;
    }) => adminFetch("/admin/schedule", { method: "POST", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "schedule"] });
      toast.success("Slot jadwal ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      id: string;
      showId?: string;
      dayOfWeek?: number;
      startHour?: number;
      endHour?: number;
      sortOrder?: number;
    }) => adminFetch("/admin/schedule", { method: "PUT", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "schedule"] });
      toast.success("Jadwal diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch("/admin/schedule", { method: "DELETE", params: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "schedule"] });
      toast.success("Slot jadwal dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
