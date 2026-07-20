"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";
import { toast } from "sonner";

export type SocialLinkRow = {
  id: string;
  platform: string;
  label: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
};

export function useSocialLinks() {
  return useQuery({
    queryKey: ["admin", "social-links"],
    queryFn: () =>
      adminFetch<{ links: SocialLinkRow[] }>("/admin/social-links"),
  });
}

export function useCreateSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SocialLinkRow>) =>
      adminFetch("/admin/social-links", { method: "POST", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "social-links"] });
      toast.success("Link ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SocialLinkRow> & { id: string }) =>
      adminFetch("/admin/social-links", { method: "PUT", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "social-links"] });
      toast.success("Link diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteSocialLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch("/admin/social-links", { method: "DELETE", params: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "social-links"] });
      toast.success("Link dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
