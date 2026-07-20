"use client";

import { useState } from "react";
import { useAuth } from "@/lib/admin/auth-context";
import {
  Group,
  Text,
  Burger,
  Menu,
  UnstyledButton,
  Modal,
  Stack,
  PasswordInput,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { adminFetch } from "@/lib/admin/api-client";
import { toast } from "sonner";
import {
  strongPasswordSchema,
  passwordRequirementsText,
} from "@/lib/schemas/password";
import { ADMIN_INK } from "@/lib/admin/ui";

interface AdminHeaderProps {
  navOpened: boolean;
  onNavToggle: () => void;
}

export function AdminHeader({ navOpened, onNavToggle }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const [
    passwordModalOpened,
    { open: openPasswordModal, close: closePasswordModal },
  ] = useDisclosure(false);

  return (
    <>
      <Group h="100%" px="md" justify="space-between">
        <Group gap="sm">
          <Burger
            opened={navOpened}
            onClick={onNavToggle}
            hiddenFrom="sm"
            size="sm"
            color={ADMIN_INK}
            aria-label={navOpened ? "Tutup navigasi" : "Buka navigasi"}
          />
          <Group gap={6} align="baseline">
            <Text size="lg" fw={900} tt="uppercase" lts={-0.5} c={ADMIN_INK}>
              Solagracia
            </Text>
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              style={{
                border: "1px solid var(--mantine-color-dark-2)",
                borderRadius: 4,
                padding: "1px 6px",
              }}
            >
              Admin
            </Text>
          </Group>
        </Group>
        <Menu position="bottom-end" shadow="md" width={200}>
          <Menu.Target>
            <UnstyledButton
              px="sm"
              py={6}
              aria-label="Menu akun"
              style={{
                borderRadius: "var(--mantine-radius-md)",
                minHeight: 44,
                transition: "background-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "var(--mantine-color-gray-0)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Group gap="xs">
                <i
                  className="material-icons text-[20px]"
                  style={{ color: "var(--mantine-color-gray-7)" }}
                  aria-hidden
                >
                  account_circle
                </i>
                <Text size="sm" fw={500} visibleFrom="sm" lineClamp={1} maw={180}>
                  {user?.email || "Admin"}
                </Text>
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<i className="material-icons text-[16px]">lock</i>}
              onClick={openPasswordModal}
            >
              Ubah Password
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<i className="material-icons text-[16px]">logout</i>}
              onClick={logout}
              color="red"
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <ChangePasswordModal
        opened={passwordModalOpened}
        onClose={closePasswordModal}
        logout={logout}
      />
    </>
  );
}

function ChangePasswordModal({
  opened,
  onClose,
  logout,
}: {
  opened: boolean;
  onClose: () => void;
  logout: () => Promise<void>;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  }

  async function handleSubmit() {
    setError("");

    if (!oldPassword) {
      setError("Masukkan password lama.");
      return;
    }

    const strength = strongPasswordSchema.safeParse(newPassword);
    if (!strength.success) {
      setError(strength.error.issues[0].message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (oldPassword === newPassword) {
      setError("Password baru harus berbeda dari yang lama.");
      return;
    }

    setLoading(true);
    try {
      await adminFetch("/admin/change-password", {
        method: "POST",
        body: { oldPassword, newPassword },
      });
      toast.success("Password berhasil diubah. Silakan login kembali.");
      reset();
      onClose();
      logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Ubah Password"
      centered
      size="sm"
    >
      <Stack gap="md">
        <PasswordInput
          label="Password Lama"
          placeholder="Masukkan password saat ini"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.currentTarget.value)}
          required
        />
        <PasswordInput
          label="Password Baru"
          placeholder="Minimal 12 karakter dengan variasi"
          description={passwordRequirementsText}
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
          required
          minLength={12}
        />
        <PasswordInput
          label="Konfirmasi Password Baru"
          placeholder="Ulangi password baru"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          required
        />
        {error ? (
          <Text size="sm" c="red" role="alert">
            {error}
          </Text>
        ) : null}
        <Group justify="flex-end" mt="sm">
          <Button
            variant="default"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            color="dark"
            onClick={handleSubmit}
            loading={loading}
            disabled={!oldPassword || !newPassword || !confirmPassword}
          >
            Simpan
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
