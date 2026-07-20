"use client";

import { useEffect, useState } from "react";
import { Button, Group, Stack, Text, Textarea, TextInput } from "@mantine/core";
import {
  ImageUpload,
  type ImageAspectRatio,
} from "@/components/admin/ImageUpload";
import { changeValue } from "@/lib/admin/form";
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
};

export const SEO_FIELDS: SiteFieldDef[] = [
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

export const BRAND_FIELDS: SiteFieldDef[] = [
  { key: "display_name", label: "Display name" },
  {
    key: "frequency_label",
    label: "Frequency label",
    description: "SoT untuk stempel Studio · 98.2 FM",
  },
];

export const HERO_FIELDS: SiteFieldDef[] = [
  { key: "brand", label: "Brand / title" },
  { key: "eyebrow", label: "Eyebrow" },
  { key: "vertical_tagline", label: "Tagline vertikal" },
  { key: "support", label: "Support / deskripsi", multiline: true },
  {
    key: "cover_url",
    label: "Cover image",
    image: true,
    valueType: "image",
    // Match full-bleed hero (~16:9 viewport), not portrait crop
    aspectRatio: "video",
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
    description:
      'Contoh: [{"label":"Tentang","href":"#tentang","variant":"text","icon":"arrow"}]',
  },
  { key: "mobile_cta_label", label: "Mobile CTA label" },
  {
    key: "mobile_cta_href",
    label: "Mobile CTA href",
    valueType: "url",
  },
];

function cfgValue(
  config: SiteConfigMap | undefined,
  section: string,
  key: string,
): string {
  return config?.[section]?.[key]?.value ?? "";
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
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      next[field.key] = cfgValue(config, section, field.key);
    }
    setValues(next);
  }, [config, fields, section]);

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
