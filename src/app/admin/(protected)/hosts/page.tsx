"use client";

import { useState } from "react";
import {
  useHosts,
  useCreateHost,
  useUpdateHost,
  useDeleteHost,
  type Host,
} from "@/hooks/admin/useHosts";
import {
  Button,
  Group,
  Stack,
  Text,
  Title,
  Modal,
  TextInput,
  Textarea,
  Paper,
  Badge,
  ActionIcon,
  Skeleton,
  SimpleGrid,
  Avatar,
  SegmentedControl,
  NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TagInput } from "@/components/admin/TagInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FIELD_LIMITS } from "@/lib/admin/constants";

interface HostFormState {
  name: string;
  photoUrl: string;
  photoAlt: string;
  roleTitle: string;
  tagline: string;
  tags: string[];
  displayNumber: string;
  href: string;
  bio: string;
  sortOrder: number;
  status: string;
}

const EMPTY_FORM: HostFormState = {
  name: "",
  photoUrl: "",
  photoAlt: "",
  roleTitle: "",
  tagline: "",
  tags: [],
  displayNumber: "",
  href: "",
  bio: "",
  sortOrder: 0,
  status: "published",
};

function formFromHost(host: Host): HostFormState {
  return {
    name: host.name,
    photoUrl: host.photoUrl,
    photoAlt: host.photoAlt,
    roleTitle: host.roleTitle,
    tagline: host.tagline,
    tags: host.tags || [],
    displayNumber: host.displayNumber,
    href: host.href,
    bio: host.bio,
    sortOrder: host.sortOrder,
    status: host.status,
  };
}

export default function HostsAdminPage() {
  const { data, isLoading } = useHosts();
  const createHost = useCreateHost();
  const updateHost = useUpdateHost();
  const deleteHost = useDeleteHost();

  const [opened, { open, close }] = useDisclosure(false);
  const [editing, setEditing] = useState<Host | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Host | null>(null);
  const [form, setForm] = useState<HostFormState>(EMPTY_FORM);

  const hosts = data?.hosts || [];

  function updateField<K extends keyof HostFormState>(
    key: K,
    value: HostFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: hosts.length });
    open();
  }

  function openEdit(host: Host) {
    setEditing(host);
    setForm(formFromHost(host));
    open();
  }

  async function handleSubmit() {
    const payload = {
      name: form.name,
      photoUrl: form.photoUrl,
      photoAlt: form.photoAlt || undefined,
      roleTitle: form.roleTitle,
      tagline: form.tagline,
      tags: form.tags,
      displayNumber: form.displayNumber || undefined,
      href: form.href || undefined,
      bio: form.bio || undefined,
      sortOrder: form.sortOrder,
      status: form.status,
    };

    if (editing) {
      await updateHost.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createHost.mutateAsync(payload);
    }
    close();
  }

  const isSaving = createHost.isPending || updateHost.isPending;
  const isFormValid =
    form.name.trim().length > 0 &&
    form.roleTitle.trim().length > 0 &&
    form.tagline.trim().length > 0 &&
    form.photoUrl.trim().length > 0;

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={4} fw={700}>
            Penyiar
          </Title>
          <Text size="sm" c="dimmed">
            Kelola daftar penyiar untuk section Penyiar di homepage.
          </Text>
        </div>
        <Button color="dark" onClick={openCreate}>
          Tambah Penyiar
        </Button>
      </Group>

      {isLoading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={200} />
          ))}
        </SimpleGrid>
      ) : hosts.length === 0 ? (
        <Paper
          withBorder
          p="xl"
          style={{ borderColor: "#0a0a0a", background: "#fff", textAlign: "center" }}
        >
          <Text size="sm" c="dimmed">
            Belum ada penyiar.
          </Text>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {hosts.map((host) => (
            <Paper
              key={host.id}
              p="md"
              withBorder
              style={{ borderColor: "#0a0a0a", background: "#fff" }}
            >
              <Stack align="center" gap="sm">
                <Avatar size={72} radius="md" src={host.photoUrl} alt={host.name}>
                  {host.name[0]}
                </Avatar>
                <div style={{ textAlign: "center" }}>
                  {host.displayNumber && (
                    <Badge variant="outline" color="dark" size="xs" mb={4}>
                      {host.displayNumber}
                    </Badge>
                  )}
                  <Text size="sm" fw={700}>
                    {host.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {host.roleTitle}
                  </Text>
                  <Text size="xs" mt={4}>
                    {host.tagline}
                  </Text>
                </div>
                {host.tags.length > 0 && (
                  <Group gap={4} justify="center">
                    {host.tags.map((tag, i) => (
                      <Badge key={i} variant="light" color="gray" size="xs">
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                )}
                <StatusBadge status={host.status} />
                <Group gap="xs">
                  <ActionIcon
                    variant="outline"
                    color="dark"
                    onClick={() => openEdit(host)}
                    aria-label="Edit"
                  >
                    ✎
                  </ActionIcon>
                  <ActionIcon
                    variant="outline"
                    color="dark"
                    onClick={() => setDeleteTarget(host)}
                    aria-label="Arsipkan"
                  >
                    ×
                  </ActionIcon>
                </Group>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={editing ? "Edit Penyiar" : "Tambah Penyiar"}
        centered
        size="lg"
      >
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb={6}>
              Foto
            </Text>
            <div style={{ maxWidth: 200, margin: "0 auto" }}>
              <ImageUpload
                value={form.photoUrl}
                onChange={(url) => updateField("photoUrl", url)}
                bucket="hosts"
                aspectRatio="portrait"
              />
            </div>
          </div>

          <TextInput
            label="Alt teks foto"
            value={form.photoAlt}
            onChange={(e) => updateField("photoAlt", e.currentTarget.value)}
            maxLength={200}
          />

          <Group grow>
            <TextInput
              label="Nama"
              value={form.name}
              onChange={(e) => updateField("name", e.currentTarget.value)}
              required
              maxLength={FIELD_LIMITS.NAME_MAX}
            />
            <TextInput
              label="Peran / Role"
              value={form.roleTitle}
              onChange={(e) => updateField("roleTitle", e.currentTarget.value)}
              required
              maxLength={FIELD_LIMITS.ROLE_MAX}
            />
          </Group>

          <TextInput
            label="Tagline"
            value={form.tagline}
            onChange={(e) => updateField("tagline", e.currentTarget.value)}
            required
            maxLength={FIELD_LIMITS.TAGLINE_MAX}
          />

          <Group grow>
            <TextInput
              label="Nomor tampil"
              placeholder="#01"
              value={form.displayNumber}
              onChange={(e) =>
                updateField("displayNumber", e.currentTarget.value)
              }
              maxLength={FIELD_LIMITS.DISPLAY_NUMBER_MAX}
            />
            <TextInput
              label="Link (href)"
              placeholder="#program"
              value={form.href}
              onChange={(e) => updateField("href", e.currentTarget.value)}
            />
          </Group>

          <div>
            <Text size="sm" fw={500} mb={6}>
              Tags
            </Text>
            <TagInput
              value={form.tags}
              onChange={(tags) => updateField("tags", tags)}
              maxTags={FIELD_LIMITS.TAG_MAX_COUNT}
              maxLength={FIELD_LIMITS.TAG_ITEM_MAX}
            />
          </div>

          <Textarea
            label="Bio"
            value={form.bio}
            onChange={(e) => updateField("bio", e.currentTarget.value)}
            maxLength={FIELD_LIMITS.BIO_MAX}
            autosize
            minRows={2}
            maxRows={4}
          />

          <NumberInput
            label="Urutan"
            value={form.sortOrder}
            onChange={(v) => updateField("sortOrder", Number(v) || 0)}
            min={0}
          />

          <div>
            <Text size="sm" fw={500} mb={6}>
              Status
            </Text>
            <SegmentedControl
              value={form.status}
              onChange={(v) => updateField("status", v)}
              data={[
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
              ]}
              fullWidth
              color="dark"
            />
          </div>

          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Batal
            </Button>
            <Button
              color="dark"
              loading={isSaving}
              disabled={!isFormValid}
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
        title="Arsipkan penyiar?"
        description={`"${deleteTarget?.name}" akan diarsipkan (status draft). Penyiar dengan acara aktif tidak bisa diarsipkan.`}
        confirmLabel="Arsipkan"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteHost.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        loading={deleteHost.isPending}
      />
    </Stack>
  );
}
