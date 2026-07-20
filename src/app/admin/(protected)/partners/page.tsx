"use client";

import { useEffect, useState } from "react";
import {
  usePartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
  type Partner,
} from "@/hooks/admin/usePartners";
import {
  useSponsorshipPlans,
  useCreateSponsorshipPlan,
  useUpdateSponsorshipPlan,
  useDeleteSponsorshipPlan,
  type SponsorshipPlanRow,
} from "@/hooks/admin/useSponsorshipPlans";
import {
  useSiteConfig,
  useUpdateSiteConfig,
  type SiteConfigMap,
} from "@/hooks/admin/useSiteConfig";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { TagInput } from "@/components/admin/TagInput";
import { partnerContent as defaults } from "@/data/partner";

type TabId = "history" | "plans";

type PartnerFormState = {
  name: string;
  initials: string;
  logoUrl: string;
  href: string;
  sortOrder: number;
  status: string;
};

type PlanFormState = {
  name: string;
  price: string;
  unit: string;
  features: string[];
  isFeatured: boolean;
  whatsappMessage: string;
  sortOrder: number;
  status: string;
};

const EMPTY_PARTNER: PartnerFormState = {
  name: "",
  initials: "",
  logoUrl: "",
  href: "",
  sortOrder: 0,
  status: "published",
};

const EMPTY_PLAN: PlanFormState = {
  name: "",
  price: "",
  unit: "",
  features: [],
  isFeatured: false,
  whatsappMessage: "",
  sortOrder: 0,
  status: "published",
};

const PARTNER_CONFIG_FIELDS = [
  { key: "history_label", label: "Label riwayat marquee" },
  { key: "plans_label", label: "Label paket sponsorship" },
  { key: "more_info_label", label: "Label More Info" },
  { key: "more_info_href", label: "Link More Info" },
  { key: "whatsapp_number", label: "Nomor WhatsApp (digit saja)" },
  { key: "plan_cta_label", label: "Label CTA paket" },
  { key: "currency_prefix", label: "Prefix mata uang" },
] as const;

function partnerFormFromRow(row: Partner): PartnerFormState {
  return {
    name: row.name,
    initials: row.initials,
    logoUrl: row.logoUrl,
    href: row.href,
    sortOrder: row.sortOrder,
    status: row.status,
  };
}

function planFormFromRow(row: SponsorshipPlanRow): PlanFormState {
  return {
    name: row.name,
    price: row.price,
    unit: row.unit,
    features: row.features || [],
    isFeatured: row.isFeatured,
    whatsappMessage: row.whatsappMessage,
    sortOrder: row.sortOrder,
    status: row.status,
  };
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function configValue(
  config: SiteConfigMap | undefined,
  key: string,
  fallback: string,
): string {
  return config?.partner?.[key]?.value?.trim() || fallback;
}

export default function PartnersAdminPage() {
  const [tab, setTab] = useState<TabId>("history");

  const { data: partnersData, isLoading: partnersLoading } = usePartners();
  const createPartner = useCreatePartner();
  const updatePartner = useUpdatePartner();
  const deletePartner = useDeletePartner();

  const { data: plansData, isLoading: plansLoading } = useSponsorshipPlans();
  const createPlan = useCreateSponsorshipPlan();
  const updatePlan = useUpdateSponsorshipPlan();
  const deletePlan = useDeleteSponsorshipPlan();

  const { data: siteConfigData } = useSiteConfig();
  const updateSiteConfig = useUpdateSiteConfig();

  const [partnerModal, partnerModalHandlers] = useDisclosure(false);
  const [planModal, planModalHandlers] = useDisclosure(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingPlan, setEditingPlan] = useState<SponsorshipPlanRow | null>(null);
  const [deletePartnerTarget, setDeletePartnerTarget] = useState<Partner | null>(
    null,
  );
  const [deletePlanTarget, setDeletePlanTarget] = useState<SponsorshipPlanRow | null>(
    null,
  );
  const [partnerForm, setPartnerForm] = useState<PartnerFormState>(EMPTY_PARTNER);
  const [planForm, setPlanForm] = useState<PlanFormState>(EMPTY_PLAN);
  const [configDraft, setConfigDraft] = useState<Record<string, string>>({});

  const partners = partnersData?.partners || [];
  const plans = plansData?.plans || [];
  const publishedPlanCount = plansData?.publishedCount ?? 0;
  const maxPublishedPlans = plansData?.maxPublished ?? 3;
  const canAddPublishedPlan = publishedPlanCount < maxPublishedPlans;

  useEffect(() => {
    const config = siteConfigData?.config;
    if (!config) return;
    const next: Record<string, string> = {};
    for (const field of PARTNER_CONFIG_FIELDS) {
      next[field.key] = configValue(
        config,
        field.key,
        defaults[
          field.key === "history_label" ? "historyLabel"
          : field.key === "plans_label" ? "plansLabel"
          : field.key === "more_info_label" ? "moreInfoLabel"
          : field.key === "more_info_href" ? "moreInfoHref"
          : field.key === "whatsapp_number" ? "whatsappNumber"
          : field.key === "plan_cta_label" ? "planCtaLabel"
          : "currencyPrefix"
        ],
      );
    }
    setConfigDraft(next);
  }, [siteConfigData]);

  function openCreatePartner() {
    setEditingPartner(null);
    setPartnerForm({
      ...EMPTY_PARTNER,
      sortOrder: partners.length,
    });
    partnerModalHandlers.open();
  }

  function openEditPartner(row: Partner) {
    setEditingPartner(row);
    setPartnerForm(partnerFormFromRow(row));
    partnerModalHandlers.open();
  }

  function openCreatePlan() {
    setEditingPlan(null);
    setPlanForm({
      ...EMPTY_PLAN,
      sortOrder: plans.length,
      status: canAddPublishedPlan ? "published" : "draft",
    });
    planModalHandlers.open();
  }

  function openEditPlan(row: SponsorshipPlanRow) {
    setEditingPlan(row);
    setPlanForm(planFormFromRow(row));
    planModalHandlers.open();
  }

  async function submitPartner() {
    const payload = {
      name: partnerForm.name.trim(),
      initials: (partnerForm.initials || deriveInitials(partnerForm.name)).toUpperCase(),
      logoUrl: partnerForm.logoUrl || undefined,
      href: partnerForm.href || undefined,
      sortOrder: partnerForm.sortOrder,
      status: partnerForm.status,
    };

    if (editingPartner) {
      await updatePartner.mutateAsync({ id: editingPartner.id, ...payload });
    } else {
      await createPartner.mutateAsync(payload);
    }
    partnerModalHandlers.close();
  }

  async function submitPlan() {
    const payload = {
      name: planForm.name.trim(),
      price: planForm.price.trim(),
      unit: planForm.unit.trim(),
      features: planForm.features,
      isFeatured: planForm.isFeatured,
      whatsappMessage: planForm.whatsappMessage.trim(),
      sortOrder: planForm.sortOrder,
      status: planForm.status,
    };

    if (editingPlan) {
      await updatePlan.mutateAsync({ id: editingPlan.id, ...payload });
    } else {
      await createPlan.mutateAsync(payload);
    }
    planModalHandlers.close();
  }

  async function savePartnerConfig() {
    await updateSiteConfig.mutateAsync({
      updates: PARTNER_CONFIG_FIELDS.map((field) => ({
        section: "partner",
        key: field.key,
        value: configDraft[field.key]?.trim() || null,
        valueType: "text" as const,
      })),
    });
  }

  const partnerSaving = createPartner.isPending || updatePartner.isPending;
  const planSaving = createPlan.isPending || updatePlan.isPending;
  const partnerValid =
    partnerForm.name.trim().length > 0 &&
    (partnerForm.initials.trim().length > 0 ||
      deriveInitials(partnerForm.name).length > 0);
  const planValid =
    planForm.name.trim().length > 0 &&
    planForm.price.trim().length > 0 &&
    planForm.features.length > 0;

  const planPublishBlocked =
    planForm.status === "published" &&
    !canAddPublishedPlan &&
    (!editingPlan || editingPlan.status !== "published");

  return (
    <Stack gap="lg">
      <div>
        <Title order={4} fw={700}>
          Partner
        </Title>
        <Text size="sm" c="dimmed">
          Riwayat marquee + paket sponsorship (maks. 3 publikasi).
        </Text>
      </div>

      <Paper p="md" withBorder style={{ borderColor: "#0a0a0a" }}>
        <Stack gap="md">
          <Text fw={600} size="sm">
            Label & WhatsApp section Partner
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {PARTNER_CONFIG_FIELDS.map((field) => (
              <TextInput
                key={field.key}
                label={field.label}
                value={configDraft[field.key] ?? ""}
                onChange={(e) =>
                  setConfigDraft((prev) => ({
                    ...prev,
                    [field.key]: e.currentTarget.value,
                  }))
                }
              />
            ))}
          </SimpleGrid>
          <Group justify="flex-end">
            <Button
              color="dark"
              loading={updateSiteConfig.isPending}
              onClick={savePartnerConfig}
            >
              Simpan label
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Tabs value={tab} onChange={(v) => setTab((v as TabId) || "history")}>
        <Tabs.List>
          <Tabs.Tab value="history">Riwayat Partner</Tabs.Tab>
          <Tabs.Tab value="plans">
            Paket Sponsorship
            <Badge ml={8} size="xs" variant="outline" color="dark">
              {publishedPlanCount}/{maxPublishedPlans}
            </Badge>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="history" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Logo atau inisial untuk marquee &quot;Yang pernah bersama kami&quot;.
              </Text>
              <Button color="dark" onClick={openCreatePartner}>
                Tambah Partner
              </Button>
            </Group>

            {partnersLoading ?
              <Skeleton height={120} />
            : partners.length === 0 ?
              <Text size="sm" c="dimmed">
                Belum ada partner riwayat. Tambahkan dari tombol di atas.
              </Text>
            : <Stack gap="sm">
                {partners.map((partner) => (
                  <Paper
                    key={partner.id}
                    p="md"
                    withBorder
                    style={{ borderColor: "#0a0a0a", background: "#fff" }}
                  >
                    <Group justify="space-between" align="flex-start">
                      <Group gap="md">
                        {partner.logoUrl ?
                          <Avatar src={partner.logoUrl} alt={partner.name} size={44} radius="sm" />
                        : <Avatar size={44} radius="sm" color="dark">
                            {partner.initials}
                          </Avatar>
                        }
                        <Stack gap={2}>
                          <Group gap="xs">
                            <Text fw={700}>{partner.name}</Text>
                            <StatusBadge status={partner.status} />
                          </Group>
                          <Text size="xs" c="dimmed">
                            Inisial: {partner.initials}
                            {partner.href ? ` · ${partner.href}` : ""}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Urutan: {partner.sortOrder}
                          </Text>
                        </Stack>
                      </Group>
                      <Group gap="xs">
                        <ActionIcon
                          variant="outline"
                          color="dark"
                          onClick={() => openEditPartner(partner)}
                          aria-label="Edit"
                        >
                          ✎
                        </ActionIcon>
                        <ActionIcon
                          variant="outline"
                          color="dark"
                          onClick={() => setDeletePartnerTarget(partner)}
                          aria-label="Hapus"
                        >
                          ×
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            }
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="plans" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Maksimal {maxPublishedPlans} paket berstatus Published. Draft tidak
                dihitung.
              </Text>
              <Button color="dark" onClick={openCreatePlan}>
                Tambah Paket
              </Button>
            </Group>

            {!canAddPublishedPlan && (
              <Text size="xs" c="dimmed">
                Kuota publikasi penuh. Ubah status paket lain ke Draft atau hapus
                sebelum menambah publikasi baru.
              </Text>
            )}

            {plansLoading ?
              <Skeleton height={120} />
            : plans.length === 0 ?
              <Text size="sm" c="dimmed">
                Belum ada paket sponsorship.
              </Text>
            : <Stack gap="sm">
                {plans.map((plan) => (
                  <Paper
                    key={plan.id}
                    p="md"
                    withBorder
                    style={{ borderColor: "#0a0a0a", background: "#fff" }}
                  >
                    <Group justify="space-between" align="flex-start">
                      <Stack gap={4}>
                        <Group gap="xs">
                          <Text fw={700}>{plan.name}</Text>
                          {plan.isFeatured && (
                            <Badge color="dark" variant="filled" size="sm">
                              Featured
                            </Badge>
                          )}
                          <StatusBadge status={plan.status} />
                        </Group>
                        <Text size="sm">
                          {plan.price}
                          {plan.unit}
                        </Text>
                        <Group gap={6}>
                          {plan.features.map((feature) => (
                            <Badge key={feature} variant="outline" color="gray" size="xs">
                              {feature}
                            </Badge>
                          ))}
                        </Group>
                      </Stack>
                      <Group gap="xs">
                        <ActionIcon
                          variant="outline"
                          color="dark"
                          onClick={() => openEditPlan(plan)}
                          aria-label="Edit"
                        >
                          ✎
                        </ActionIcon>
                        <ActionIcon
                          variant="outline"
                          color="dark"
                          onClick={() => setDeletePlanTarget(plan)}
                          aria-label="Hapus"
                        >
                          ×
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            }
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={partnerModal}
        onClose={partnerModalHandlers.close}
        title={editingPartner ? "Edit Partner Riwayat" : "Tambah Partner Riwayat"}
        centered
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Nama"
            value={partnerForm.name}
            onChange={(e) => {
              const name = e.currentTarget.value;
              setPartnerForm((prev) => ({
                ...prev,
                name,
                initials:
                  prev.initials && !editingPartner ?
                    prev.initials
                  : deriveInitials(name),
              }));
            }}
            required
          />
          <TextInput
            label="Inisial (fallback tanpa logo)"
            value={partnerForm.initials}
            onChange={(e) =>
              setPartnerForm((prev) => ({
                ...prev,
                initials: e.currentTarget.value.toUpperCase().slice(0, 4),
              }))
            }
            maxLength={4}
            required
          />
          <div>
            <Text size="sm" fw={500} mb={6}>
              Logo (opsional)
            </Text>
            <ImageUpload
              value={partnerForm.logoUrl}
              onChange={(url) => setPartnerForm((prev) => ({ ...prev, logoUrl: url }))}
              bucket="partners"
              subpath="logos"
              aspectRatio="square"
            />
          </div>
          <TextInput
            label="Link website (opsional)"
            value={partnerForm.href}
            onChange={(e) =>
              setPartnerForm((prev) => ({ ...prev, href: e.currentTarget.value }))
            }
            placeholder="https://"
          />
          <NumberInput
            label="Urutan"
            value={partnerForm.sortOrder}
            onChange={(v) =>
              setPartnerForm((prev) => ({
                ...prev,
                sortOrder: typeof v === "number" ? v : 0,
              }))
            }
            min={0}
          />
          <SegmentedControl
            value={partnerForm.status}
            onChange={(value) =>
              setPartnerForm((prev) => ({ ...prev, status: value }))
            }
            data={[
              { label: "Published", value: "published" },
              { label: "Draft", value: "draft" },
            ]}
            color="dark"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={partnerModalHandlers.close}>
              Batal
            </Button>
            <Button
              color="dark"
              loading={partnerSaving}
              disabled={!partnerValid}
              onClick={submitPartner}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={planModal}
        onClose={planModalHandlers.close}
        title={editingPlan ? "Edit Paket Sponsorship" : "Tambah Paket Sponsorship"}
        centered
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Nama paket"
            value={planForm.name}
            onChange={(e) =>
              setPlanForm((prev) => ({ ...prev, name: e.currentTarget.value }))
            }
            required
          />
          <Group grow>
            <TextInput
              label="Harga"
              value={planForm.price}
              onChange={(e) =>
                setPlanForm((prev) => ({ ...prev, price: e.currentTarget.value }))
              }
              placeholder="150K"
              required
            />
            <TextInput
              label="Unit"
              value={planForm.unit}
              onChange={(e) =>
                setPlanForm((prev) => ({ ...prev, unit: e.currentTarget.value }))
              }
              placeholder="/spot"
            />
          </Group>
          <div>
            <Text size="sm" fw={500} mb={6}>
              Fitur / item paket
            </Text>
            <TagInput
              value={planForm.features}
              onChange={(features) => setPlanForm((prev) => ({ ...prev, features }))}
              maxTags={8}
              maxLength={120}
              placeholder="Durasi 60 detik"
            />
          </div>
          <Textarea
            label="Pesan WhatsApp prefilled"
            value={planForm.whatsappMessage}
            onChange={(e) =>
              setPlanForm((prev) => ({
                ...prev,
                whatsappMessage: e.currentTarget.value,
              }))
            }
            minRows={2}
          />
          <NumberInput
            label="Urutan"
            value={planForm.sortOrder}
            onChange={(v) =>
              setPlanForm((prev) => ({
                ...prev,
                sortOrder: typeof v === "number" ? v : 0,
              }))
            }
            min={0}
            max={2}
          />
          <Switch
            label="Featured card"
            checked={planForm.isFeatured}
            onChange={(e) =>
              setPlanForm((prev) => ({
                ...prev,
                isFeatured: e.currentTarget.checked,
              }))
            }
            color="dark"
          />
          <SegmentedControl
            value={planForm.status}
            onChange={(value) =>
              setPlanForm((prev) => ({ ...prev, status: value }))
            }
            data={[
              { label: "Published", value: "published" },
              { label: "Draft", value: "draft" },
            ]}
            color="dark"
          />
          {planPublishBlocked && (
            <Text size="xs" c="red">
              Sudah ada {maxPublishedPlans} paket published. Ubah status paket lain
              dulu.
            </Text>
          )}
          <Group justify="flex-end">
            <Button variant="default" onClick={planModalHandlers.close}>
              Batal
            </Button>
            <Button
              color="dark"
              loading={planSaving}
              disabled={!planValid || planPublishBlocked}
              onClick={submitPlan}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ConfirmDialog
        open={!!deletePartnerTarget}
        onOpenChange={(o) => !o && setDeletePartnerTarget(null)}
        title="Hapus partner riwayat?"
        description="Partner akan dihapus permanen dari marquee."
        onConfirm={async () => {
          if (!deletePartnerTarget) return;
          await deletePartner.mutateAsync(deletePartnerTarget.id);
          setDeletePartnerTarget(null);
        }}
        loading={deletePartner.isPending}
      />

      <ConfirmDialog
        open={!!deletePlanTarget}
        onOpenChange={(o) => !o && setDeletePlanTarget(null)}
        title="Hapus paket sponsorship?"
        description="Paket akan dihapus permanen."
        onConfirm={async () => {
          if (!deletePlanTarget) return;
          await deletePlan.mutateAsync(deletePlanTarget.id);
          setDeletePlanTarget(null);
        }}
        loading={deletePlan.isPending}
      />
    </Stack>
  );
}
