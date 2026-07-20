"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AuthGuard } from "./AuthGuard";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AuthGuard>
      <AppShell
        header={{ height: 56 }}
        navbar={{
          width: 260,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
        styles={{
          header: {
            borderBottom: "1px solid #0a0a0a",
            background: "#fff",
          },
          navbar: {
            borderRight: "1px solid #0a0a0a",
            background: "#fff",
          },
          main: {
            background: "#f5f5f5",
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
