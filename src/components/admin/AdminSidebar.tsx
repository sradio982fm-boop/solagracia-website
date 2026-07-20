"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink, Stack, Text, Divider } from "@mantine/core";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
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
  { href: "/admin/site", label: "Konfigurasi Situs", icon: "settings" },
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
    <Stack gap={0} h="100%">
      <Text
        size="xs"
        fw={500}
        c="dimmed"
        tt="uppercase"
        lts={0.5}
        px="xs"
        mb={4}
      >
        Konten
      </Text>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          component={Link}
          href={item.href}
          label={item.label}
          active={isActive(item.href)}
          leftSection={<i className="material-icons text-[18px]">{item.icon}</i>}
          onClick={onNavigate}
          variant="filled"
          color="dark"
          style={{ borderRadius: "var(--mantine-radius-md)" }}
        />
      ))}
      <Divider my="sm" color="#0a0a0a" />
    </Stack>
  );
}
