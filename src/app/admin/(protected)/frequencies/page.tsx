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
  Title,
  Modal,
  TextInput,
  Switch,
  Paper,
  Badge,
  ActionIcon,
  Skeleton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";

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
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={4} fw={700}>
            Frekuensi & Streaming
          </Title>
          <Text size="sm" c="dimmed">
            Audio default · video popup (HLS/MP4). Seed: siar.us streams.
          </Text>
        </div>
        <Button color="dark" onClick={openCreate}>
          Tambah Frekuensi
        </Button>
      </Group>

      {isLoading ? (
        <Skeleton height={120} />
      ) : (
        <Stack gap="sm">
          {frequencies.map((f) => (
            <Paper
              key={f.id}
              p="md"
              withBorder
              style={{ borderColor: "#0a0a0a", background: "#fff" }}
            >
              <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                  <Group gap="xs">
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
                  <Text size="xs" c="dimmed">
                    Audio: {f.audioUrl}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Video: {f.videoUrl || "—"}
                  </Text>
                </Stack>
                <Group gap="xs">
                  {!f.isDefault && (
                    <Button
                      size="xs"
                      variant="outline"
                      color="dark"
                      onClick={() =>
                        updateFrequency.mutate({ id: f.id, isDefault: true })
                      }
                    >
                      Set default
                    </Button>
                  )}
                  <ActionIcon
                    variant="outline"
                    color="dark"
                    onClick={() => openEdit(f)}
                    aria-label="Edit"
                  >
                    ✎
                  </ActionIcon>
                  <ActionIcon
                    variant="outline"
                    color="dark"
                    onClick={() => setDeleteTarget(f)}
                    aria-label="Hapus"
                  >
                    ×
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
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
              setForm((p) => ({ ...p, label: e.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Station name"
            value={form.stationName}
            onChange={(e) =>
              setForm((p) => ({ ...p, stationName: e.currentTarget.value }))
            }
          />
          <TextInput
            label="Audio URL"
            value={form.audioUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, audioUrl: e.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Video URL (HLS/MP4)"
            value={form.videoUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, videoUrl: e.currentTarget.value }))
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
