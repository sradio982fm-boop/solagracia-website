"use client";

import { useEffect, useState } from "react";
import {
  Accordion,
  Button,
  Group,
  Skeleton,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { FooterConfigPanel } from "@/components/admin/FooterConfigPanel";
import { KontakConfigPanel } from "@/components/admin/KontakConfigPanel";
import { PrivacyConfigPanel } from "@/components/admin/PrivacyConfigPanel";
import { SectionOrderManager } from "@/components/admin/SectionOrderManager";
import { TentangConfigPanel } from "@/components/admin/TentangConfigPanel";
import {
  useSectionHeaders,
  useSiteConfig,
  useUpdateSectionHeader,
  useUpdateSiteConfig,
  type SectionHeader,
  type SiteConfigEntry,
  type SiteConfigMap,
  type SiteConfigValueType,
} from "@/hooks/admin/useSiteConfig";

type FieldDef = {
  key: string;
  label: string;
  multiline?: boolean;
  valueType?: SiteConfigValueType;
  image?: boolean;
  aspectRatio?: "square" | "video" | "portrait" | "banner";
  description?: string;
  maxLength?: number;
};

const SEO_FIELDS: FieldDef[] = [
  { key: "site_name", label: "Nama situs" },
  { key: "parent_name", label: "Parent brand" },
  { key: "title", label: "Title (SEO)", maxLength: 70 },
  { key: "subtitle", label: "Subtitle" },
  {
    key: "description",
    label: "Description",
    multiline: true,
    maxLength: 160,
  },
  {
    key: "og_image_url",
    label: "OG image",
    image: true,
    valueType: "image",
    aspectRatio: "video",
  },
  {
    key: "favicon_url",
    label: "Favicon",
    image: true,
    valueType: "image",
    aspectRatio: "square",
    description: "Upload PNG/WebP/ICO — dipakai di tab browser",
  },
];

const BRAND_FIELDS: FieldDef[] = [
  { key: "display_name", label: "Display name" },
  {
    key: "frequency_label",
    label: "Frequency label",
    description: "SoT untuk stempel Studio · 98.2 FM",
  },
];

const HERO_FIELDS: FieldDef[] = [
  { key: "brand", label: "Brand / title" },
  { key: "eyebrow", label: "Eyebrow" },
  { key: "vertical_tagline", label: "Tagline vertikal" },
  { key: "support", label: "Support / deskripsi", multiline: true },
  {
    key: "cover_url",
    label: "Cover image",
    image: true,
    valueType: "image",
    aspectRatio: "portrait",
  },
  { key: "cover_alt", label: "Cover alt text", multiline: true },
  {
    key: "logo_url",
    label: "Logo",
    image: true,
    valueType: "image",
    aspectRatio: "square",
  },
  {
    key: "ctas",
    label: "Desktop CTAs (JSON)",
    multiline: true,
    valueType: "json",
    description: 'Contoh: [{"label":"Tentang","href":"#tentang","variant":"text","icon":"arrow"}]',
  },
  { key: "mobile_cta_label", label: "Mobile CTA label" },
  {
    key: "mobile_cta_href",
    label: "Mobile CTA href",
    valueType: "url",
  },
];

const PANELS: Array<{
  key: string;
  title: string;
  icon: string;
  fields: FieldDef[];
}> = [
  { key: "seo", title: "SEO & Identitas Situs", icon: "search", fields: SEO_FIELDS },
  { key: "brand", title: "Brand", icon: "verified", fields: BRAND_FIELDS },
  { key: "hero", title: "Hero", icon: "home", fields: HERO_FIELDS },
];

function cfgValue(
  config: SiteConfigMap | undefined,
  section: string,
  key: string,
): string {
  return config?.[section]?.[key]?.value ?? "";
}

function SectionPanel({
  section,
  title,
  icon,
  fields,
  config,
  onSave,
  saving,
}: {
  section: string;
  title: string;
  icon: string;
  fields: FieldDef[];
  config: SiteConfigMap | undefined;
  onSave: (
    updates: Array<{
      section: string;
      key: string;
      value: string | null;
      valueType?: SiteConfigValueType;
    }>,
  ) => Promise<void>;
  saving: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      next[field.key] = cfgValue(config, section, field.key);
    }
    setValues(next);
  }, [config, fields, section]);

  return (
    <Accordion.Item value={section}>
      <Accordion.Control
        icon={
          <ThemeIcon variant="light" color="gray" size="sm" radius="md">
            <i className="material-icons text-[14px]">{icon}</i>
          </ThemeIcon>
        }
      >
        <Text size="sm" fw={500}>
          {title}
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="md">
          {fields.map((field) => {
            const value = values[field.key] ?? "";
            if (field.image) {
              return (
                <div key={field.key}>
                  <Text size="xs" c="dimmed" mb={4}>
                    {field.label}
                  </Text>
                  <ImageUpload
                    value={value}
                    onChange={(url) =>
                      setValues((prev) => ({ ...prev, [field.key]: url }))
                    }
                    bucket="site"
                    subpath={section}
                    aspectRatio={field.aspectRatio ?? "video"}
                  />
                </div>
              );
            }

            if (field.multiline) {
              return (
                <div key={field.key}>
                  <Textarea
                    label={field.label}
                    description={field.description}
                    value={value}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [field.key]: e.currentTarget.value,
                      }))
                    }
                    rows={field.key === "ctas" ? 5 : 3}
                    size="sm"
                  />
                  {field.maxLength ? (
                    <Text size="xs" c="dimmed" mt={4}>
                      {value.length}/{field.maxLength}
                    </Text>
                  ) : null}
                </div>
              );
            }

            return (
              <div key={field.key}>
                <TextInput
                  label={field.label}
                  description={field.description}
                  value={value}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [field.key]: e.currentTarget.value,
                    }))
                  }
                  size="sm"
                />
                {field.maxLength ? (
                  <Text size="xs" c="dimmed" mt={4}>
                    {value.length}/{field.maxLength}
                  </Text>
                ) : null}
              </div>
            );
          })}
          <Group justify="flex-end">
            <Button
              size="xs"
              loading={saving}
              onClick={() =>
                onSave(
                  fields.map((field) => {
                    const existing = config?.[section]?.[field.key] as
                      | SiteConfigEntry
                      | undefined;
                    return {
                      section,
                      key: field.key,
                      value: values[field.key] ?? "",
                      valueType:
                        field.valueType ??
                        existing?.valueType ??
                        "text",
                    };
                  }),
                )
              }
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

function HeaderPanel({
  header,
  onSave,
  saving,
}: {
  header: SectionHeader;
  onSave: (data: {
    section: string;
    eyebrow?: string;
    title?: string;
    titleAccent?: string;
    description?: string;
  }) => Promise<void>;
  saving: boolean;
}) {
  const [eyebrow, setEyebrow] = useState(header.eyebrow);
  const [title, setTitle] = useState(header.title);
  const [titleAccent, setTitleAccent] = useState(header.titleAccent);
  const [description, setDescription] = useState(header.description);

  useEffect(() => {
    setEyebrow(header.eyebrow);
    setTitle(header.title);
    setTitleAccent(header.titleAccent);
    setDescription(header.description);
  }, [header]);

  return (
    <Accordion.Item value={header.section}>
      <Accordion.Control
        icon={
          <ThemeIcon variant="light" color="gray" size="sm" radius="md">
            <i className="material-icons text-[14px]">title</i>
          </ThemeIcon>
        }
      >
        <Text size="sm" fw={500} tt="capitalize">
          {header.section}
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="md">
          <TextInput
            label="Eyebrow"
            value={eyebrow}
            onChange={(e) => setEyebrow(e.currentTarget.value)}
            size="sm"
          />
          <TextInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            size="sm"
          />
          <TextInput
            label="Title accent"
            value={titleAccent}
            onChange={(e) => setTitleAccent(e.currentTarget.value)}
            size="sm"
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            rows={3}
            size="sm"
          />
          <Group justify="flex-end">
            <Button
              size="xs"
              loading={saving}
              onClick={() =>
                onSave({
                  section: header.section,
                  eyebrow,
                  title,
                  titleAccent,
                  description,
                })
              }
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export default function SiteAdminPage() {
  const { data, isLoading } = useSiteConfig();
  const { data: headersData, isLoading: headersLoading } = useSectionHeaders();
  const updateConfig = useUpdateSiteConfig();
  const updateHeader = useUpdateSectionHeader();

  if (isLoading || headersLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={28} width={220} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <div>
        <Title order={4}>Konfigurasi Situs</Title>
        <Text size="sm" c="dimmed" mt={4}>
          SEO, brand, hero, tentang, kontak, footer, marquee, dan header seksi.
          Fallback ke data lokal jika kosong.
        </Text>
      </div>

      <Accordion
        multiple
        defaultValue={["seo", "hero", "tentang", "kontak", "footer"]}
      >
        {PANELS.map((panel) => (
          <SectionPanel
            key={panel.key}
            section={panel.key}
            title={panel.title}
            icon={panel.icon}
            fields={panel.fields}
            config={data?.config}
            saving={updateConfig.isPending}
            onSave={async (updates) => {
              await updateConfig.mutateAsync({ updates });
            }}
          />
        ))}
        <Accordion.Item value="tentang">
          <Accordion.Control
            icon={
              <ThemeIcon variant="light" color="gray" size="sm" radius="md">
                <i className="material-icons text-[14px]">info</i>
              </ThemeIcon>
            }
          >
            <Text size="sm" fw={500}>
              Tentang Kami
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <TentangConfigPanel
              config={data?.config}
              saving={updateConfig.isPending}
              onSave={async (updates) => {
                await updateConfig.mutateAsync({ updates });
              }}
            />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="kontak">
          <Accordion.Control
            icon={
              <ThemeIcon variant="light" color="gray" size="sm" radius="md">
                <i className="material-icons text-[14px]">call</i>
              </ThemeIcon>
            }
          >
            <Text size="sm" fw={500}>
              Kontak Kami
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <KontakConfigPanel
              config={data?.config}
              saving={updateConfig.isPending}
              onSave={async (updates) => {
                await updateConfig.mutateAsync({ updates });
              }}
            />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="footer">
          <Accordion.Control
            icon={
              <ThemeIcon variant="light" color="gray" size="sm" radius="md">
                <i className="material-icons text-[14px]">vertical_align_bottom</i>
              </ThemeIcon>
            }
          >
            <Text size="sm" fw={500}>
              Footer & Marquee
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <FooterConfigPanel
              config={data?.config}
              saving={updateConfig.isPending}
              onSave={async (updates) => {
                await updateConfig.mutateAsync({ updates });
              }}
            />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="privacy">
          <Accordion.Control
            icon={
              <ThemeIcon variant="light" color="gray" size="sm" radius="md">
                <i className="material-icons text-[14px]">policy</i>
              </ThemeIcon>
            }
          >
            <Text size="sm" fw={500}>
              Kebijakan Privasi
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <PrivacyConfigPanel
              config={data?.config}
              saving={updateConfig.isPending}
              onSave={async (updates) => {
                await updateConfig.mutateAsync({ updates });
              }}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <div>
        <Title order={5} mb="xs">
          Urutan & visibility section
        </Title>
        <Text size="sm" c="dimmed" mb="sm">
          Homepage order, GRACIA letters, menu labels, dan surface metadata.
        </Text>
        <SectionOrderManager />
      </div>

      <div>
        <Title order={5} mb="xs">
          Section headers
        </Title>
        <Text size="sm" c="dimmed" mb="sm">
          Eyebrow / title / accent / description untuk tiap seksi publik.
        </Text>
        <Accordion multiple>
          {(headersData?.headers || []).map((header) => (
            <HeaderPanel
              key={header.id || header.section}
              header={header}
              saving={updateHeader.isPending}
              onSave={async (payload) => {
                await updateHeader.mutateAsync(payload);
              }}
            />
          ))}
        </Accordion>
      </div>
    </Stack>
  );
}
