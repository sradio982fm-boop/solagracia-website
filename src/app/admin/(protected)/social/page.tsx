"use client";

import { useState } from "react";
import {
  useSocialLinks,
  useCreateSocialLink,
  useUpdateSocialLink,
  useDeleteSocialLink,
  type SocialLinkRow,
} from "@/hooks/admin/useSocialLinks";
import {
  Button,
  Group,
  Stack,
  Text,
  Modal,
  TextInput,
  Select,
  Switch,
  Badge,
  Skeleton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminSurface } from "@/components/admin/AdminSurface";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { changeValue } from "@/lib/admin/form";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
  { value: "facebook", label: "Facebook" },
  { value: "spotify", label: "Spotify" },
];

type FormState = {
  platform: string;
  label: string;
  url: string;
  isActive: boolean;
};

const EMPTY: FormState = {
  platform: "instagram",
  label: "",
  url: "",
  isActive: true,
};

export default function SocialAdminPage() {
  const { data, isLoading } = useSocialLinks();
  const createLink = useCreateSocialLink();
  const updateLink = useUpdateSocialLink();
  const deleteLink = useDeleteSocialLink();

  const [opened, { open, close }] = useDisclosure(false);
  const [editing, setEditing] = useState<SocialLinkRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SocialLinkRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const links = data?.links || [];

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    open();
  }

  function openEdit(row: SocialLinkRow) {
    setEditing(row);
    setForm({
      platform: row.platform,
      label: row.label,
      url: row.url,
      isActive: row.isActive,
    });
    open();
  }

  async function handleSubmit() {
    if (editing) {
      await updateLink.mutateAsync({ id: editing.id, ...form });
    } else {
      await createLink.mutateAsync({
        ...form,
        sortOrder: links.length,
      });
    }
    close();
  }

  return (
    <Stack gap="lg">
      <AdminPageHeader
        title="Social Media"
        description="Satu sumber untuk hero, kontak, dan footer."
        actions={
          <Button
            color="dark"
            onClick={openCreate}
            leftSection={
              <i className="material-icons text-[18px]" aria-hidden>
                add
              </i>
            }
          >
            Tambah Link
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton height={100} radius="md" />
      ) : links.length === 0 ? (
        <AdminEmptyState
          icon="share"
          title="Belum ada social link"
          description="Tambahkan link platform untuk ditampilkan di situs."
          actionLabel="Tambah Link"
          onAction={openCreate}
        />
      ) : (
        <Stack gap="sm">
          {links.map((row) => (
            <AdminSurface key={row.id} p="md">
              <Group justify="space-between" wrap="wrap" gap="sm">
                <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                  <Group gap="xs" wrap="wrap">
                    <Text fw={700}>{row.label}</Text>
                    <Badge color="dark" variant="outline">
                      {row.platform}
                    </Badge>
                    {!row.isActive && (
                      <Badge color="gray" variant="outline">
                        Hidden
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed" truncate="end">
                    {row.url}
                  </Text>
                </Stack>
                <Group gap="xs">
                  <AdminIconButton
                    icon="edit"
                    label="Edit link"
                    onClick={() => openEdit(row)}
                  />
                  <AdminIconButton
                    icon="delete"
                    label="Hapus link"
                    color="red"
                    onClick={() => setDeleteTarget(row)}
                  />
                </Group>
              </Group>
            </AdminSurface>
          ))}
        </Stack>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={editing ? "Edit Link" : "Tambah Link"}
        centered
      >
        <Stack gap="md">
          <Select
            label="Platform"
            data={PLATFORMS}
            value={form.platform}
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                platform: v || "instagram",
                label: p.label || PLATFORMS.find((x) => x.value === v)?.label || "",
              }))
            }
          />
          <TextInput
            label="Label"
            value={form.label}
            onChange={(e) =>
              setForm((p) => ({ ...p, label: changeValue(e) }))
            }
            required
          />
          <TextInput
            label="URL"
            value={form.url}
            onChange={(e) =>
              setForm((p) => ({ ...p, url: changeValue(e) }))
            }
            required
          />
          <Switch
            label="Aktif"
            checked={form.isActive}
            color="dark"
            onChange={(e) =>
              setForm((p) => ({ ...p, isActive: e.currentTarget.checked }))
            }
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Batal
            </Button>
            <Button
              color="dark"
              loading={createLink.isPending || updateLink.isPending}
              disabled={!form.label || !form.url}
              onClick={handleSubmit}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Hapus link?"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteLink.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        loading={deleteLink.isPending}
      />
    </Stack>
  );
}
