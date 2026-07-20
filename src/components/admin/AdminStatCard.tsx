"use client";

import Link from "next/link";
import { Group, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { AdminSurface } from "./AdminSurface";

interface AdminStatCardProps {
  label: string;
  value?: string | number;
  detail?: string;
  icon?: string;
  href?: string;
  loading?: boolean;
}

export function AdminStatCard({
  label,
  value,
  detail,
  icon,
  href,
  loading,
}: AdminStatCardProps) {
  const card = (
    <AdminSurface
      p="md"
      interactive={Boolean(href)}
      style={{ height: "100%" }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} lts={0.4}>
            {label}
          </Text>
          {loading ? (
            <Skeleton height={28} width={72} />
          ) : (
            <Text size="xl" fw={700} ff="monospace" lh={1.2}>
              {typeof value === "number"
                ? value.toLocaleString("id-ID")
                : (value ?? "—")}
            </Text>
          )}
          {detail && !loading ? (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {detail}
            </Text>
          ) : null}
        </Stack>
        {icon ? (
          <ThemeIcon variant="light" color="sg" size="lg" radius="md">
            <i className="material-icons text-[18px]" aria-hidden>
              {icon}
            </i>
          </ThemeIcon>
        ) : null}
      </Group>
    </AdminSurface>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      {card}
    </Link>
  );
}
