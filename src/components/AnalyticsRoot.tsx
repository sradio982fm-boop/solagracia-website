"use client";

import { usePathname } from "next/navigation";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export function AnalyticsRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  return (
    <>
      {children}
      {isAdmin ? null : <AnalyticsTracker />}
    </>
  );
}
