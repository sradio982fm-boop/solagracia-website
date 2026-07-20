"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink, Stack, Text, Divider, ScrollArea } from "@mantine/core";
import { ADMIN_BORDER } from "@/lib/admin/ui";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
      { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
    ],
  },
  {
    label: "Konten",
    items: [
      { href: "/admin/schedule", label: "Jadwal", icon: "calendar_month" },
      { href: "/admin/hosts", label: "Penyiar", icon: "group" },
      { href: "/admin/partners", label: "Partner", icon: "handshake" },
      { href: "/admin/ads", label: "Iklan", icon: "campaign" },
      { href: "/admin/social", label: "Social Media", icon: "share" },
      {
        href: "/admin/frequencies",
        label: "Frekuensi",
        icon: "settings_input_antenna",
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      { href: "/admin/site", label: "Konfigurasi Situs", icon: "settings" },
    ],
  },
] as const;

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard" || pathname === "/admin";
    }
    return pathname.startsWith(href);
  }

  return (
    <ScrollArea type="scroll" style={{ height: "100%" }} offsetScrollbars>
      <Stack gap="md" pb="md">
        {NAV_GROUPS.map((group, groupIndex) => (
          <Stack key={group.label} gap={2}>
            {groupIndex > 0 ? (
              <Divider color={ADMIN_BORDER} my={4} />
            ) : null}
            <Text
              size="xs"
              fw={600}
              c="dimmed"
              tt="uppercase"
              lts={0.6}
              px="xs"
              mb={2}
            >
              {group.label}
            </Text>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                active={isActive(item.href)}
                leftSection={
                  <i className="material-icons text-[18px]" aria-hidden>
                    {item.icon}
                  </i>
                }
                onClick={onNavigate}
                variant="light"
                color="dark"
                aria-current={isActive(item.href) ? "page" : undefined}
              />
            ))}
          </Stack>
        ))}
      </Stack>
    </ScrollArea>
  );
}
