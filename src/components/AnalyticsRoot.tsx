"use client";

import { usePathname } from "next/navigation";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWARegister } from "@/components/PWARegister";

export function AnalyticsRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  return (
    <>
      {isAdmin ? null : <PWARegister />}
      {children}
      {isAdmin ? null : (
        <>
          <AnalyticsTracker />
          <PWAInstallPrompt />
        </>
      )}
    </>
  );
}
