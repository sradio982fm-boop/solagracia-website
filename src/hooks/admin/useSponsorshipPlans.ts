"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";
import { toast } from "sonner";

export type SponsorshipPlanRow = {
  id: string;
  name: string;
  price: string;
  unit: string;
  features: string[];
  isFeatured: boolean;
  whatsappMessage: string;
  sortOrder: number;
  status: string;
};

type PlansResponse = {
  plans: SponsorshipPlanRow[];
  publishedCount: number;
  maxPublished: number;
};

export function useSponsorshipPlans() {
  return useQuery({
    queryKey: ["admin", "sponsorship-plans"],
    queryFn: () => adminFetch<PlansResponse>("/admin/sponsorship-plans"),
  });
}

export function useCreateSponsorshipPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SponsorshipPlanRow>) =>
      adminFetch("/admin/sponsorship-plans", { method: "POST", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "sponsorship-plans"] });
      toast.success("Paket sponsorship ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateSponsorshipPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SponsorshipPlanRow> & { id: string }) =>
      adminFetch("/admin/sponsorship-plans", { method: "PUT", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "sponsorship-plans"] });
      toast.success("Paket sponsorship diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSponsorshipPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch("/admin/sponsorship-plans", {
        method: "DELETE",
        params: { id },
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "sponsorship-plans"] });
      toast.success("Paket sponsorship dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
