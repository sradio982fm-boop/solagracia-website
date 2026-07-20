"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AuthGuard } from "./AuthGuard";
import { ADMIN_BORDER, ADMIN_INK, ADMIN_PAGE_BG, ADMIN_SURFACE } from "@/lib/admin/ui";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AuthGuard>
      <AppShell
        header={{ height: 56 }}
        navbar={{
          width: 248,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
        styles={{
          header: {
            borderBottom: `1px solid ${ADMIN_BORDER}`,
            background: ADMIN_SURFACE,
          },
          navbar: {
            borderRight: `1px solid ${ADMIN_BORDER}`,
            background: ADMIN_SURFACE,
          },
          main: {
            background: ADMIN_PAGE_BG,
            color: ADMIN_INK,
          },
        }}
      >
        <AppShell.Header>
          <AdminHeader navOpened={opened} onNavToggle={toggle} />
        </AppShell.Header>

        <AppShell.Navbar p="sm">
          <AdminSidebar onNavigate={close} />
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </AuthGuard>
  );
}
