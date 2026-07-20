"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";
import type { SectionConfigRow } from "@/lib/section-config";
import { toast } from "sonner";

type SectionConfigResponse = {
  sections: SectionConfigRow[];
};

export function useSectionConfig() {
  return useQuery({
    queryKey: ["admin", "section-config"],
    queryFn: () =>
      adminFetch<SectionConfigResponse>("/admin/section-config"),
  });
}

export function useReorderSections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: string[]) =>
      adminFetch("/admin/section-config", {
        method: "PUT",
        body: { order },
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "section-config"] });
      toast.success("Urutan section disimpan");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateSectionConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      body:
        | {
            section: string;
            isVisible?: boolean;
            letter?: string;
            navLabel?: string;
            menuLabel?: string;
            surface?: "dark" | "smoke" | "white";
          }
        | {
            updates: Array<{
              section: string;
              isVisible?: boolean;
              letter?: string;
              navLabel?: string;
              menuLabel?: string;
              surface?: "dark" | "smoke" | "white";
            }>;
          },
    ) => adminFetch("/admin/section-config", { method: "PUT", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "section-config"] });
      toast.success("Konfigurasi section diperbarui");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
