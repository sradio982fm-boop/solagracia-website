"use client";

import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api-client";
import type { DashboardStats } from "@/lib/admin/dashboard";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminFetch<DashboardStats>("/admin/dashboard"),
  });
}
