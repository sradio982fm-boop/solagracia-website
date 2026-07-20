"use client";

import { useAuth } from "@/lib/admin/auth-context";
import { Group, Text, Burger, Menu, UnstyledButton } from "@mantine/core";

interface AdminHeaderProps {
  navOpened: boolean;
  onNavToggle: () => void;
}

export function AdminHeader({ navOpened, onNavToggle }: AdminHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="sm">
        <Burger
          opened={navOpened}
          onClick={onNavToggle}
          hiddenFrom="sm"
          size="sm"
          color="#0a0a0a"
        />
        <Group gap={6} align="baseline">
          <Text size="lg" fw={900} tt="uppercase" lts={-0.5} c="#0a0a0a">
            Solagracia
          </Text>
          <Text size="xs" fw={700} c="dimmed">
            Admin
          </Text>
        </Group>
      </Group>
      <Menu position="bottom-end" shadow="md" width={180}>
        <Menu.Target>
          <UnstyledButton
            px="sm"
            py={4}
            style={{ borderRadius: "var(--mantine-radius-md)" }}
          >
            <Group gap="xs">
              <Text size="sm" fw={500} visibleFrom="sm">
                {user?.email || "Admin"}
              </Text>
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={logout}>Logout</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
