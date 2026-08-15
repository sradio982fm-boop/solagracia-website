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

export type SiteConfigUpdate = {
  section: string;
  key: string;
  value: string | null;
  valueType?: SiteConfigValueType;
};

function applySiteConfigUpdates(
  config: SiteConfigMap,
  updates: SiteConfigUpdate[],
): SiteConfigMap {
  const next: SiteConfigMap = { ...config };
  for (const update of updates) {
    next[update.section] = {
      ...(next[update.section] ?? {}),
      [update.key]: {
        value: update.value,
        valueType: update.valueType ?? "text",
      },
    };
  }
  return next;
}

export function useSiteConfig() {
  return useQuery({
    queryKey: ["admin", "site-config"],
    queryFn: () => adminFetch<SiteConfigResponse>("/admin/site-config"),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useUpdateSiteConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SiteConfigUpdate | { updates: SiteConfigUpdate[] }) =>
      adminFetch("/admin/site-config", { method: "PUT", body }),
    onSuccess: (_res, body) => {
      const updates =
        "updates" in body && Array.isArray(body.updates)
          ? body.updates
          : [body as SiteConfigUpdate];
      qc.setQueryData<SiteConfigResponse>(["admin", "site-config"], (prev) => {
        if (!prev?.config) return prev;
        return { config: applySiteConfigUpdates(prev.config, updates) };
      });
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
