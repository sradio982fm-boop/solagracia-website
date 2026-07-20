"use client";

import { useState } from "react";
import {
  useFrequencies,
  useCreateFrequency,
  useUpdateFrequency,
  useDeleteFrequency,
  type Frequency,
} from "@/hooks/admin/useFrequencies";
import {
  Button,
  Group,
  Stack,
  Text,
  Modal,
  TextInput,
  Switch,
  Badge,
  Skeleton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminSurface } from "@/components/admin/AdminSurface";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { changeValue } from "@/lib/admin/form";

interface FrequencyFormState {
  label: string;
  videoUrl: string;
  audioUrl: string;
  posterUrl: string;
  stationName: string;
  isDefault: boolean;
  isActive: boolean;
}

const EMPTY_FORM: FrequencyFormState = {
  label: "",
  videoUrl: "",
  audioUrl: "",
  posterUrl: "",
  stationName: "Solagracia",
  isDefault: false,
  isActive: true,
};

export default function FrequenciesPage() {
  const { data, isLoading } = useFrequencies();
  const createFrequency = useCreateFrequency();
  const updateFrequency = useUpdateFrequency();
  const deleteFrequency = useDeleteFrequency();

  const [opened, { open, close }] = useDisclosure(false);
  const [editing, setEditing] = useState<Frequency | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Frequency | null>(null);
  const [form, setForm] = useState<FrequencyFormState>(EMPTY_FORM);

  const frequencies = data?.frequencies || [];

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    open();
  }

  function openEdit(f: Frequency) {
    setEditing(f);
    setForm({
      label: f.label,
      videoUrl: f.videoUrl,
      audioUrl: f.audioUrl,
      posterUrl: f.posterUrl,
      stationName: f.stationName,
      isDefault: f.isDefault,
      isActive: f.isActive,
    });
    open();
  }

  async function handleSubmit() {
    if (editing) {
      await updateFrequency.mutateAsync({ id: editing.id, ...form });
    } else {
      await createFrequency.mutateAsync(form);
    }
    close();
  }

  const isSaving = createFrequency.isPending || updateFrequency.isPending;
  const isFormValid =
    form.label.trim().length > 0 && form.audioUrl.trim().length > 0;

  return (
    <Stack gap="lg">
      <AdminPageHeader
        title="Frekuensi & Streaming"
        description="Audio default · video popup (HLS/MP4). Seed: siar.us streams."
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
            Tambah Frekuensi
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton height={120} radius="md" />
      ) : frequencies.length === 0 ? (
        <AdminEmptyState
          icon="settings_input_antenna"
          title="Belum ada frekuensi"
          description="Tambahkan stream audio/video untuk player situs."
          actionLabel="Tambah Frekuensi"
          onAction={openCreate}
        />
      ) : (
        <Stack gap="sm">
          {frequencies.map((f) => (
            <AdminSurface key={f.id} p="md">
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
                <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
                  <Group gap="xs" wrap="wrap">
                    <Text fw={700}>{f.label}</Text>
                    {f.isDefault && (
                      <Badge color="dark" variant="filled">
                        Default
                      </Badge>
                    )}
                    {!f.isActive && (
                      <Badge color="gray" variant="outline">
                        Nonaktif
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed" truncate="end">
                    Audio: {f.audioUrl}
                  </Text>
                  <Text size="xs" c="dimmed" truncate="end">
                    Video: {f.videoUrl || "—"}
                  </Text>
                </Stack>
                <Group gap="xs">
                  {!f.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      color="dark"
                      onClick={() =>
                        updateFrequency.mutate({ id: f.id, isDefault: true })
                      }
                    >
                      Set default
                    </Button>
                  )}
                  <AdminIconButton
                    icon="edit"
                    label="Edit frekuensi"
                    onClick={() => openEdit(f)}
                  />
                  <AdminIconButton
                    icon="delete"
                    label="Hapus frekuensi"
                    color="red"
                    onClick={() => setDeleteTarget(f)}
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
        title={editing ? "Edit Frekuensi" : "Tambah Frekuensi"}
        centered
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Label"
            value={form.label}
            onChange={(e) =>
              setForm((p) => ({ ...p, label: changeValue(e) }))
            }
            required
          />
          <TextInput
            label="Station name"
            value={form.stationName}
            onChange={(e) =>
              setForm((p) => ({ ...p, stationName: changeValue(e) }))
            }
          />
          <TextInput
            label="Audio URL"
            value={form.audioUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, audioUrl: changeValue(e) }))
            }
            required
          />
          <TextInput
            label="Video URL (HLS/MP4)"
            value={form.videoUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, videoUrl: changeValue(e) }))
            }
          />
          <div>
            <Text size="sm" fw={500} mb={6}>
              Poster
            </Text>
            <ImageUpload
              value={form.posterUrl}
              onChange={(url) => setForm((p) => ({ ...p, posterUrl: url }))}
              bucket="site"
              subpath="posters"
              aspectRatio="video"
            />
          </div>
          <Switch
            label="Default"
            checked={form.isDefault}
            onChange={(e) =>
              setForm((p) => ({ ...p, isDefault: e.currentTarget.checked }))
            }
            color="dark"
          />
          <Switch
            label="Aktif"
            checked={form.isActive}
            onChange={(e) =>
              setForm((p) => ({ ...p, isActive: e.currentTarget.checked }))
            }
            color="dark"
          />
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
        title="Hapus frekuensi?"
        description="Stream ini tidak akan tersedia di player."
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteFrequency.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        loading={deleteFrequency.isPending}
      />
    </Stack>
  );
}
