"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";
import { toast } from "sonner";

export type Show = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string;
  tag: string;
  status: string;
  host: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

type ShowsResponse = { shows: Show[] };

export function useShows() {
  return useQuery({
    queryKey: ["admin", "shows"],
    queryFn: () => adminFetch<ShowsResponse>("/admin/shows"),
  });
}

export function useCreateShow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      hostId?: string | null;
      description?: string;
      coverUrl?: string;
      tag?: string;
      status?: string;
    }) => adminFetch("/admin/shows", { method: "POST", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "shows"] });
      toast.success("Acara ditambahkan");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateShow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      id: string;
      title?: string;
      hostId?: string | null;
      description?: string;
      coverUrl?: string;
      tag?: string;
      status?: string;
    }) => adminFetch("/admin/shows", { method: "PUT", body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "shows"] });
      toast.success("Acara diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteShow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch("/admin/shows", { method: "DELETE", params: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "shows"] });
      toast.success("Acara dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
