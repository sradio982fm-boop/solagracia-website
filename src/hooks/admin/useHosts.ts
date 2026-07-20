"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";
import { toast } from "sonner";

export type Host = {
  id: string;
  name: string;
  slug: string;
  photoUrl: string;
  photoAlt: string;
  roleTitle: string;
  tagline: string;
  tags: string[];
  displayNumber: string;
  href: string;
  bio: string;
  sortOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type HostsResponse = { hosts: Host[] };

export function useHosts() {
  return useQuery({
    queryKey: ["admin", "hosts"],
    queryFn: () => adminFetch<HostsResponse>("/admin/hosts"),
  });
}

export function useCreateHost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Host>) =>
      adminFetch("/admin/hosts", { method: "POST", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "hosts"] });
      toast.success("Penyiar ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateHost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Host> & { id: string }) =>
      adminFetch("/admin/hosts", { method: "PUT", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "hosts"] });
      toast.success("Penyiar diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteHost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch("/admin/hosts", { method: "DELETE", params: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "hosts"] });
      toast.success("Penyiar diarsipkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
