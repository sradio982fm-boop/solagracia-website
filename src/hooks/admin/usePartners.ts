"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";
import { toast } from "sonner";

export type Partner = {
  id: string;
  name: string;
  initials: string;
  logoUrl: string;
  href: string;
  sortOrder: number;
  status: string;
};

type PartnersResponse = { partners: Partner[] };

export function usePartners() {
  return useQuery({
    queryKey: ["admin", "partners"],
    queryFn: () => adminFetch<PartnersResponse>("/admin/partners"),
  });
}

export function useCreatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Partner>) =>
      adminFetch("/admin/partners", { method: "POST", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "partners"] });
      toast.success("Partner riwayat ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Partner> & { id: string }) =>
      adminFetch("/admin/partners", { method: "PUT", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "partners"] });
      toast.success("Partner riwayat diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch("/admin/partners", { method: "DELETE", params: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "partners"] });
      toast.success("Partner riwayat dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
