"use client";

import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export function AnalyticsRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AnalyticsTracker />
    </>
  );
}
