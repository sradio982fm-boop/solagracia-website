"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";
import { toast } from "sonner";

export type Frequency = {
  id: string;
  label: string;
  videoUrl: string;
  audioUrl: string;
  posterUrl: string;
  stationName: string;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
};

type FrequenciesResponse = { frequencies: Frequency[] };

export function useFrequencies() {
  return useQuery({
    queryKey: ["admin", "frequencies"],
    queryFn: () => adminFetch<FrequenciesResponse>("/admin/frequencies"),
  });
}

export function useCreateFrequency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Frequency>) =>
      adminFetch("/admin/frequencies", { method: "POST", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "frequencies"] });
      toast.success("Frekuensi ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateFrequency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Frequency> & { id: string }) =>
      adminFetch("/admin/frequencies", { method: "PUT", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "frequencies"] });
      toast.success("Frekuensi diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteFrequency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch("/admin/frequencies", {
        method: "DELETE",
        params: { id },
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "frequencies"] });
      toast.success("Frekuensi dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
