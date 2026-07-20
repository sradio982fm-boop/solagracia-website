"use client";

import { Paper, Stack, Text, Button } from "@mantine/core";
import { adminSurfaceStyle } from "@/lib/admin/ui";
import type { ReactNode } from "react";

interface AdminEmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function AdminEmptyState({
  icon = "inbox",
  title,
  description,
  actionLabel,
  onAction,
  children,
}: AdminEmptyStateProps) {
  return (
    <Paper
      withBorder
      p="xl"
      radius="md"
      style={adminSurfaceStyle({ textAlign: "center" })}
    >
      <Stack align="center" gap="sm" py="md">
        <i
          className="material-icons"
          style={{
            fontSize: 40,
            color: "var(--mantine-color-gray-5)",
            lineHeight: 1,
          }}
          aria-hidden
        >
          {icon}
        </i>
        <Text size="sm" fw={600}>
          {title}
        </Text>
        {description ? (
          <Text size="sm" c="dimmed" maw={360}>
            {description}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <Button color="dark" size="sm" mt="xs" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
        {children}
      </Stack>
    </Paper>
  );
}
