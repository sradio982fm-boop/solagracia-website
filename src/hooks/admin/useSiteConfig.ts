"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";
import { toast } from "sonner";

export type SiteConfigValueType = "text" | "image" | "url" | "json";

export type SiteConfigEntry = {
  value: string | null;
  valueType: SiteConfigValueType;
};

export type SiteConfigMap = Record<string, Record<string, SiteConfigEntry>>;

export type SectionHeader = {
  id: string;
  section: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  updatedAt?: string;
};

type SiteConfigResponse = { config: SiteConfigMap };
type SectionHeadersResponse = { headers: SectionHeader[] };

export function useSiteConfig() {
  return useQuery({
    queryKey: ["admin", "site-config"],
    queryFn: () => adminFetch<SiteConfigResponse>("/admin/site-config"),
  });
}

type SiteConfigUpdate = {
  section: string;
  key: string;
  value: string | null;
  valueType?: SiteConfigValueType;
};

export function useUpdateSiteConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SiteConfigUpdate | { updates: SiteConfigUpdate[] }) =>
      adminFetch("/admin/site-config", { method: "PUT", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "site-config"] });
      toast.success("Konfigurasi situs diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSectionHeaders() {
  return useQuery({
    queryKey: ["admin", "section-headers"],
    queryFn: () =>
      adminFetch<SectionHeadersResponse>("/admin/section-headers"),
  });
}

export function useUpdateSectionHeader() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      section: string;
      eyebrow?: string;
      title?: string;
      titleAccent?: string;
      description?: string;
    }) => adminFetch("/admin/section-headers", { method: "PUT", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "section-headers"] });
      toast.success("Header seksi diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
