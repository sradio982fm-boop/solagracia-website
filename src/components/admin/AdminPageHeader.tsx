"use client";

import { Group, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Title order={2} size="h3" fw={700} lh={1.2}>
          {title}
        </Title>
        {description ? (
          <Text size="sm" c="dimmed" maw={520}>
            {description}
          </Text>
        ) : null}
      </Stack>
      {actions ? (
        <Group gap="sm" wrap="wrap">
          {actions}
        </Group>
      ) : null}
    </Group>
  );
}
