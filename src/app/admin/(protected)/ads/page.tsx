"use client";

import { useMemo, useState } from "react";
import {
  useAds,
  useCreateAd,
  useUpdateAd,
  useDeleteAd,
} from "@/hooks/admin/useAds";
import {
  AD_CAPABLE_SECTIONS,
  AD_SECTION_LABELS,
  AD_VARIANT_OPTIONS,
  adSlotToPlaceholder,
  type AdCapableSectionId,
  type AdSlot,
} from "@/lib/ads";
import {
  Button,
  Group,
  Stack,
  Text,
  Modal,
  TextInput,
  Textarea,
  Skeleton,
  Select,
  Switch,
  SegmentedControl,
  NumberInput,
  Divider,
} from "@mantine/core";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminSurface } from "@/components/admin/AdminSurface";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdSlot as AdSlotPreview } from "@/components/ads/AdSlot";
import type { AdImageShape, AdSlotTone, AdSlotVariant } from "@/types/ads";

interface AdFormState {
  sectionId: AdCapableSectionId;
  label: string;
  sponsor: string;
  line: string;
  variant: AdSlotVariant;
  tone: AdSlotTone | "";
  href: string;
  imageUrl: string;
  imageAlt: string;
  imageShape: AdImageShape | "";
  isVisible: boolean;
  sortOrder: number;
  status: "draft" | "published";
  startsAt: string;
  endsAt: string;
}

const EMPTY_FORM: AdFormState = {
  sectionId: "tentang",
  label: "Partner",
  sponsor: "",
  line: "",
  variant: "panel",
  tone: "",
  href: "#kontak",
  imageUrl: "",
  imageAlt: "",
  imageShape: "banner",
  isVisible: true,
  sortOrder: 0,
  status: "published",
  startsAt: "",
  endsAt: "",
};

function formFromAd(ad: AdSlot): AdFormState {
  return {
    sectionId: ad.sectionId,
    label: ad.label,
    sponsor: ad.sponsor,
    line: ad.line,
    variant: ad.variant,
    tone: ad.tone,
    href: ad.href,
    imageUrl: ad.imageUrl,
    imageAlt: ad.imageAlt,
    imageShape: ad.imageShape || "banner",
    isVisible: ad.isVisible,
    sortOrder: ad.sortOrder,
    status: ad.status,
    startsAt: toDatetimeLocalValue(ad.startsAt),
    endsAt: toDatetimeLocalValue(ad.endsAt),
  };
}

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoOrNull(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function formatScheduleLabel(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function uploadAspectRatio(
  variant: AdSlotVariant,
  imageShape: AdImageShape | "",
): "banner" | "portrait" | "video" | "square" {
  if (variant === "image") {
    return imageShape === "portrait" ? "portrait" : "banner";
  }
  if (variant === "panel") return "portrait";
  if (variant === "inline") return "square";
  return "banner";
}

export default function AdsAdminPage() {
  const { data, isLoading } = useAds();
  const createAd = useCreateAd();
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();

  const [opened, { open, close }] = useDisclosure(false);
  const [editing, setEditing] = useState<AdSlot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdSlot | null>(null);
  const [form, setForm] = useState<AdFormState>(EMPTY_FORM);

  const ads = data?.ads || [];

  const usedSections = useMemo(
    () => new Set(ads.map((ad) => ad.sectionId)),
    [ads],
  );

  const sectionOptions = AD_CAPABLE_SECTIONS.map((id) => ({
    value: id,
    label: AD_SECTION_LABELS[id],
    disabled: !editing && usedSections.has(id),
  }));

  const isImageVariant = form.variant === "image";
  const showCopyFields = !isImageVariant;

  const previewAd = useMemo(() => {
    const placeholder = adSlotToPlaceholder({
      id: "preview",
      sectionId: form.sectionId,
      label: form.label,
      sponsor: form.sponsor,
      line: form.line,
      variant: form.variant,
      tone: form.tone,
      href: form.href,
      imageUrl: form.imageUrl,
      imageAlt: form.imageAlt,
      imageShape: form.imageShape,
      isVisible: form.isVisible,
      sortOrder: form.sortOrder,
      status: form.status,
      startsAt: form.startsAt ? toIsoOrNull(form.startsAt) : null,
      endsAt: form.endsAt ? toIsoOrNull(form.endsAt) : null,
      clickCount: 0,
    });
    const { id: _previewId, ...withoutId } = placeholder;
    return withoutId;
  }, [form]);

  function updateField<K extends keyof AdFormState>(key: K, value: AdFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setEditing(null);
    const nextSection =
      AD_CAPABLE_SECTIONS.find((id) => !usedSections.has(id)) ?? "tentang";
    setForm({ ...EMPTY_FORM, sectionId: nextSection, sortOrder: ads.length });
    open();
  }

  function openEdit(ad: AdSlot) {
    setEditing(ad);
    setForm(formFromAd(ad));
    open();
  }

  async function handleSubmit() {
    const payload = {
      sectionId: form.sectionId,
      label: form.label,
      sponsor: form.sponsor,
      line: form.line,
      variant: form.variant,
      tone: form.tone,
      href: form.href,
      imageUrl: form.imageUrl,
      imageAlt: form.imageAlt,
      imageShape: isImageVariant ? form.imageShape : "",
      isVisible: form.isVisible,
      sortOrder: form.sortOrder,
      status: form.status,
      startsAt: toIsoOrNull(form.startsAt),
      endsAt: toIsoOrNull(form.endsAt),
    };

    if (editing) {
      await updateAd.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createAd.mutateAsync(payload);
    }
    close();
  }

  const isSaving = createAd.isPending || updateAd.isPending;
  const isFormValid = Boolean(form.variant && form.sectionId);

  return (
    <Stack gap="lg">
      <AdminPageHeader
        title="Iklan"
        description="Ruang iklan per section — tentang, program, penyiar. Hero, partner, dan kontak tetap bebas iklan."
        actions={
          <Button
            color="dark"
            onClick={openCreate}
            disabled={usedSections.size >= AD_CAPABLE_SECTIONS.length}
            leftSection={
              <i className="material-icons text-[18px]" aria-hidden>
                add
              </i>
            }
          >
            Tambah Slot
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton height={120} radius="md" />
      ) : ads.length === 0 ? (
        <AdminEmptyState
          icon="campaign"
          title="Belum ada slot iklan"
          description="Tambah slot atau seed dari data statis — halaman publik memakai fallback sampai slot published ada."
          actionLabel="Tambah Slot"
          onAction={openCreate}
        />
      ) : (
        <Stack gap="sm">
          {ads.map((ad) => (
            <AdminSurface
              key={ad.id}
              p="md"
              style={{
                background: ad.isVisible
                  ? undefined
                  : "var(--mantine-color-dark-0)",
                opacity: ad.isVisible ? 1 : 0.72,
              }}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                  <Group gap="sm" wrap="wrap" align="center">
                    <Text fw={700} size="sm">
                      {AD_SECTION_LABELS[ad.sectionId]}
                    </Text>
                    <Text
                      size="xs"
                      c="dimmed"
                      tt="uppercase"
                      lts={0.6}
                      fw={600}
                    >
                      {ad.variant}
                    </Text>
                    <StatusBadge status={ad.status} />
                    {!ad.isVisible ? (
                      <Text size="xs" c="dimmed" fw={500}>
                        Hidden
                      </Text>
                    ) : null}
                  </Group>

                  {ad.sponsor ? (
                    <Text size="sm" fw={600}>
                      {ad.sponsor}
                    </Text>
                  ) : null}
                  {ad.line ? (
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {ad.line}
                    </Text>
                  ) : null}
                  {ad.imageUrl ? (
                    <Text size="xs" c="dimmed" ff="monospace" truncate>
                      {ad.imageUrl}
                    </Text>
                  ) : null}

                  <Group gap="md" mt={4}>
                    <Text size="xs" c="dimmed">
                      <Text span fw={600} c="dark">
                        {ad.clickCount.toLocaleString("id-ID")}
                      </Text>{" "}
                      klik
                    </Text>
                    {ad.startsAt || ad.endsAt ? (
                      <Text size="xs" c="dimmed">
                        {ad.startsAt
                          ? formatScheduleLabel(ad.startsAt)
                          : "—"}{" "}
                        →{" "}
                        {ad.endsAt ? formatScheduleLabel(ad.endsAt) : "—"}
                      </Text>
                    ) : null}
                  </Group>
                </Stack>

                <Group gap={4} wrap="nowrap" align="center">
                  <Switch
                    size="xs"
                    color="dark"
                    checked={ad.isVisible}
                    onChange={(e) =>
                      updateAd.mutate({
                        id: ad.id,
                        isVisible: e.currentTarget.checked,
                      })
                    }
                    aria-label="Tampilkan di situs"
                  />
                  <AdminIconButton
                    icon="edit"
                    label="Edit iklan"
                    onClick={() => openEdit(ad)}
                  />
                  <AdminIconButton
                    icon="delete"
                    label="Hapus iklan"
                    color="red"
                    onClick={() => setDeleteTarget(ad)}
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
        title={editing ? "Edit Slot Iklan" : "Tambah Slot Iklan"}
        centered
        size="xl"
      >
        <Stack gap="md">
          <Select
            label="Section"
            data={sectionOptions}
            value={form.sectionId}
            onChange={(value) =>
              value && updateField("sectionId", value as AdCapableSectionId)
            }
            disabled={Boolean(editing)}
            required
          />

          <Select
            label="Variant"
            data={AD_VARIANT_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            value={form.variant}
            onChange={(value) =>
              value && updateField("variant", value as AdSlotVariant)
            }
            required
          />

          <Group grow>
            <TextInput
              label="Label"
              description="Quiet plate label — e.g. Partner"
              value={form.label}
              onChange={(e) => updateField("label", e.currentTarget.value)}
            />
            <Select
              label="Tone"
              clearable
              data={[
                { value: "match", label: "Match section" },
                { value: "ink", label: "Ink (dark plate)" },
              ]}
              value={form.tone || null}
              onChange={(value) =>
                updateField("tone", (value ?? "") as AdSlotTone | "")
              }
            />
          </Group>

          {showCopyFields ? (
            <>
              <TextInput
                label="Sponsor / headline"
                value={form.sponsor}
                onChange={(e) => updateField("sponsor", e.currentTarget.value)}
              />
              <Textarea
                label="Supporting line"
                value={form.line}
                onChange={(e) => updateField("line", e.currentTarget.value)}
                minRows={2}
                autosize
              />
            </>
          ) : null}

          {isImageVariant ? (
            <Select
              label="Image shape"
              data={[
                { value: "banner", label: "Banner (4:1)" },
                { value: "portrait", label: "Portrait (3:4)" },
              ]}
              value={form.imageShape || "banner"}
              onChange={(value) =>
                updateField("imageShape", (value ?? "banner") as AdImageShape)
              }
            />
          ) : null}

          <TextInput
            label="Link (href)"
            description="URL atau anchor — e.g. #kontak"
            value={form.href}
            onChange={(e) => updateField("href", e.currentTarget.value)}
          />

          <Group grow align="flex-end">
            <TextInput
              label="Mulai tayang"
              description="Kosongkan = langsung aktif"
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => updateField("startsAt", e.currentTarget.value)}
            />
            <TextInput
              label="Selesai tayang"
              description="Kosongkan = tanpa batas"
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => updateField("endsAt", e.currentTarget.value)}
            />
          </Group>

          <div>
            <Text size="sm" fw={500} mb={6}>
              Creative
            </Text>
            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => updateField("imageUrl", url)}
              bucket="ads"
              subpath={form.sectionId}
              aspectRatio={uploadAspectRatio(form.variant, form.imageShape)}
            />
          </div>

          <TextInput
            label="Image alt"
            value={form.imageAlt}
            onChange={(e) => updateField("imageAlt", e.currentTarget.value)}
          />

          <Group grow>
            <NumberInput
              label="Sort order"
              min={0}
              value={form.sortOrder}
              onChange={(value) =>
                updateField("sortOrder", typeof value === "number" ? value : 0)
              }
            />
            <div>
              <Text size="sm" fw={500} mb={8}>
                Status
              </Text>
              <SegmentedControl
                fullWidth
                color="dark"
                value={form.status}
                onChange={(value) =>
                  updateField("status", value as "draft" | "published")
                }
                data={[
                  { label: "Draft", value: "draft" },
                  { label: "Published", value: "published" },
                ]}
              />
            </div>
          </Group>

          <Switch
            label="Visible on site"
            description="Sembunyikan tanpa menghapus creative"
            checked={form.isVisible}
            onChange={(e) =>
              updateField("isVisible", e.currentTarget.checked)
            }
            color="dark"
          />

          <Divider label="Preview" labelPosition="center" />

          <AdminSurface p="md">
            <AdSlotPreview ad={previewAd} />
          </AdminSurface>

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
        title="Hapus slot iklan?"
        description="Creative akan dihapus dari CMS. Halaman publik kembali ke fallback statis jika ada."
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteAd.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        loading={deleteAd.isPending}
      />
    </Stack>
  );
}
