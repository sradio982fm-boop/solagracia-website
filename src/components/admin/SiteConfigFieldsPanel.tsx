"use client";

import { Button, Group, Stack, Text, Textarea, TextInput } from "@mantine/core";
import {
  ImageUpload,
  type ImageAspectRatio,
} from "@/components/admin/ImageUpload";
import { changeValue } from "@/lib/admin/form";
import { configText } from "@/lib/cms-parse";
import { useDraftFromSource } from "@/hooks/useDraftFromSource";
import { heroContent as fallbackHero } from "@/data/hero";
import { site as fallbackSite } from "@/data/site";
import type {
  SiteConfigEntry,
  SiteConfigMap,
  SiteConfigValueType,
} from "@/hooks/admin/useSiteConfig";

export type SiteFieldDef = {
  key: string;
  label: string;
  multiline?: boolean;
  valueType?: SiteConfigValueType;
  image?: boolean;
  aspectRatio?: ImageAspectRatio;
  description?: string;
  maxLength?: number;
  fallback?: string;
};

export const SEO_FIELDS: SiteFieldDef[] = [
  { key: "site_name", label: "Nama situs", fallback: fallbackSite.name },
  { key: "parent_name", label: "Parent brand", fallback: fallbackSite.parent },
  { key: "title", label: "Title (SEO)", maxLength: 70, fallback: fallbackSite.title },
  { key: "subtitle", label: "Subtitle" },
  {
    key: "description",
    label: "Description",
    multiline: true,
    maxLength: 160,
    fallback: fallbackSite.description,
  },
  {
    key: "og_image_url",
    label: "OG image",
    image: true,
    valueType: "image",
    aspectRatio: "video",
    fallback: "/cover-image.png",
  },
  {
    key: "favicon_url",
    label: "Favicon",
    image: true,
    valueType: "image",
    aspectRatio: "square",
    description: "Upload PNG/WebP/ICO — dipakai di tab browser",
    fallback: "/favicon.ico",
  },
];

export const BRAND_FIELDS: SiteFieldDef[] = [
  { key: "display_name", label: "Display name", fallback: fallbackSite.name },
  {
    key: "frequency_label",
    label: "Frequency label",
    description: "SoT untuk stempel Studio · 98.2 FM. Kosongkan untuk menyembunyikan.",
    fallback: "98.2 FM",
  },
  {
    key: "parent_site_url",
    label: "S Radio website URL",
    valueType: "url",
    description: "Tombol cross-link ke situs S Radio (kosong = sembunyikan)",
  },
  {
    key: "parent_site_label",
    label: "S Radio button label",
    description: 'Default: "S Radio 98.2FM Streaming"',
  },
];

export const HERO_FIELDS: SiteFieldDef[] = [
  {
    key: "brand",
    label: "Brand / title",
    multiline: true,
    description:
      "Enter = baris baru di judul (contoh: Solagracia / Digital Radio)",
    fallback: fallbackHero.brand,
  },
  { key: "eyebrow", label: "Eyebrow", fallback: fallbackHero.eyebrow },
  {
    key: "vertical_tagline",
    label: "Tagline vertikal",
    fallback: fallbackHero.verticalTagline,
  },
  {
    key: "support",
    label: "Support / deskripsi",
    multiline: true,
    description: "Kosongkan untuk menyembunyikan di frontend",
    fallback: fallbackHero.support,
  },
  {
    key: "cover_url",
    label: "Cover image",
    image: true,
    valueType: "image",
    aspectRatio: "video",
    fallback: fallbackHero.coverSrc,
  },
  {
    key: "cover_alt",
    label: "Cover alt text",
    multiline: true,
    fallback: fallbackHero.coverAlt,
  },
  {
    key: "logo_url",
    label: "Logo",
    image: true,
    valueType: "image",
    aspectRatio: "square",
    fallback: fallbackHero.logoSrc,
  },
  {
    key: "ctas",
    label: "Desktop CTAs (JSON)",
    multiline: true,
    valueType: "json",
    description:
      'Kosongkan atau [] untuk menyembunyikan. Contoh: [{"label":"Tentang","href":"#tentang","variant":"text","icon":"arrow"}]',
    fallback: JSON.stringify(fallbackHero.ctas),
  },
  {
    key: "mobile_cta_label",
    label: "Mobile CTA label",
    description: "Kosongkan untuk menyembunyikan tombol atas di HP",
    fallback: fallbackHero.mobileCtaLabel,
  },
  {
    key: "mobile_cta_href",
    label: "Mobile CTA href",
    valueType: "url",
    fallback: fallbackHero.mobileCtaHref,
  },
];

function cfgValue(
  config: SiteConfigMap | undefined,
  section: string,
  key: string,
  fallback = "",
): string {
  return configText(config?.[section], key, fallback);
}

function valuesFromConfig(
  config: SiteConfigMap | undefined,
  section: string,
  fields: SiteFieldDef[],
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const field of fields) {
    next[field.key] = cfgValue(
      config,
      section,
      field.key,
      field.fallback ?? "",
    );
  }
  return next;
}

type Props = {
  section: string;
  fields: SiteFieldDef[];
  config: SiteConfigMap | undefined;
  saving: boolean;
  onSave: (
    updates: Array<{
      section: string;
      key: string;
      value: string | null;
      valueType?: SiteConfigValueType;
    }>,
  ) => Promise<void>;
};

export function SiteConfigFieldsPanel({
  section,
  fields,
  config,
  saving,
  onSave,
}: Props) {
  const [values, setValues] = useDraftFromSource(config, (source) =>
    valuesFromConfig(source, section, fields),
  );

  return (
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
                    [field.key]: changeValue(e),
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
                  [field.key]: changeValue(e),
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
                  valueType: field.valueType ?? existing?.valueType ?? "text",
                };
              }),
            )
          }
        >
          Simpan
        </Button>
      </Group>
    </Stack>
  );
}
