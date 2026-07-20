"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";
import type { AdSlot } from "@/lib/ads";
import { toast } from "sonner";

type AdsResponse = { ads: AdSlot[] };

export type AdSlotInput = Partial<
  Omit<AdSlot, "id" | "createdAt" | "updatedAt">
> & {
  id?: string;
};

export function useAds() {
  return useQuery({
    queryKey: ["admin", "ads"],
    queryFn: () => adminFetch<AdsResponse>("/admin/ads"),
  });
}

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdSlotInput) =>
      adminFetch("/admin/ads", { method: "POST", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "ads"] });
      toast.success("Slot iklan ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdSlotInput & { id: string }) =>
      adminFetch("/admin/ads", { method: "PUT", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "ads"] });
      toast.success("Slot iklan diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch("/admin/ads", { method: "DELETE", params: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "ads"] });
      toast.success("Slot iklan dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
