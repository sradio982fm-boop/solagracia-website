"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink, Stack, Text, Divider, ScrollArea } from "@mantine/core";
import { SITE_NAV_CHILDREN } from "@/lib/admin/site-nav";
import { ADMIN_BORDER, ADMIN_TEAL } from "@/lib/admin/ui";

type NavChild = {
  href: string;
  label: string;
  icon: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: string;
  children?: ReadonlyArray<NavChild>;
};

type NavGroup = {
  label: string;
  items: ReadonlyArray<NavItem>;
};

const NAV_GROUPS: ReadonlyArray<NavGroup> = [
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
      {
        href: "/admin/site",
        label: "Konfigurasi Situs",
        icon: "settings",
        children: SITE_NAV_CHILDREN.map((child) => ({
          href: child.href,
          label: child.label,
          icon: child.icon,
        })),
      },
    ],
  },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const siteBranchActive = pathname.startsWith("/admin/site");

  function isExactActive(href: string) {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard" || pathname === "/admin";
    }
    return pathname === href;
  }

  function isBranchActive(href: string) {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard" || pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
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
              c={ADMIN_TEAL}
              tt="uppercase"
              lts={0.6}
              px="xs"
              mb={2}
              style={{ opacity: 0.75 }}
            >
              {group.label}
            </Text>
            {group.items.map((item) => {
              if (item.children?.length) {
                return (
                  <NavLink
                    key={item.href}
                    label={item.label}
                    leftSection={
                      <i className="material-icons text-[18px]" aria-hidden>
                        {item.icon}
                      </i>
                    }
                    childrenOffset={28}
                    opened
                    active={siteBranchActive}
                    variant="light"
                    color="sg"
                  >
                    {item.children.map((child) => (
                      <NavLink
                        key={child.href}
                        component={Link}
                        href={child.href}
                        label={child.label}
                        active={isExactActive(child.href)}
                        leftSection={
                          <i
                            className="material-icons text-[16px]"
                            aria-hidden
                          >
                            {child.icon}
                          </i>
                        }
                        onClick={onNavigate}
                        variant="light"
                        color="sg"
                        aria-current={
                          isExactActive(child.href) ? "page" : undefined
                        }
                      />
                    ))}
                  </NavLink>
                );
              }

              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  active={isBranchActive(item.href)}
                  leftSection={
                    <i className="material-icons text-[18px]" aria-hidden>
                      {item.icon}
                    </i>
                  }
                  onClick={onNavigate}
                  variant="light"
                  color="sg"
                  aria-current={
                    isBranchActive(item.href) ? "page" : undefined
                  }
                />
              );
            })}
          </Stack>
        ))}
      </Stack>
    </ScrollArea>
  );
}
