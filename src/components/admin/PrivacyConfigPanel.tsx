"use client";

import { Button, Group, Stack, Switch, Text, Textarea, TextInput } from "@mantine/core";
import type { SiteConfigMap } from "@/hooks/admin/useSiteConfig";
import {
  FALLBACK_PRIVACY,
  PRIVACY_FOOTER_LINK_DEFAULT,
  PRIVACY_FOOTER_LINK_KEY,
} from "@/lib/legal";
import { configBool, configText } from "@/lib/cms-parse";
import { changeChecked, changeValue } from "@/lib/admin/form";
import { useDraftFromSource } from "@/hooks/useDraftFromSource";

type Props = {
  config: SiteConfigMap | undefined;
  saving: boolean;
  onSave: (
    updates: Array<{
      section: string;
      key: string;
      value: string | null;
      valueType?: "text" | "image" | "url" | "json";
    }>,
  ) => Promise<void>;
};

function parseBody(config: SiteConfigMap | undefined): string {
  const entry = config?.legal?.privacy_body;
  if (entry === undefined) return FALLBACK_PRIVACY.body.join("\n\n");
  const raw = entry.value ?? "";
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) return parsed.join("\n\n");
  } catch {
    /* plain */
  }
  return raw;
}

type PrivacyDraft = {
  title: string;
  updatedLabel: string;
  body: string;
  showFooterLink: boolean;
};

function draftFromConfig(config: SiteConfigMap | undefined): PrivacyDraft {
  return {
    title: configText(config?.legal, "privacy_title", FALLBACK_PRIVACY.title),
    updatedLabel: configText(
      config?.legal,
      "privacy_updated_label",
      FALLBACK_PRIVACY.updatedLabel,
    ),
    body: parseBody(config),
    showFooterLink: configBool(
      config?.legal,
      PRIVACY_FOOTER_LINK_KEY,
      PRIVACY_FOOTER_LINK_DEFAULT,
    ),
  };
}

export function PrivacyConfigPanel({ config, saving, onSave }: Props) {
  const [draft, setDraft] = useDraftFromSource(config, draftFromConfig);
  const { title, updatedLabel, body, showFooterLink } = draft;

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Konten halaman publik /privasi.
      </Text>
      <Switch
        label="Tampilkan tautan Privasi di footer"
        description="Matikan untuk menyembunyikan tombol Privasi di baris legal footer. Halaman /privasi tetap ada."
        checked={showFooterLink}
        onChange={(e) =>
          setDraft((prev) => ({
            ...prev,
            showFooterLink: changeChecked(e),
          }))
        }
        color="dark"
        size="md"
      />
      <TextInput
        label="Title"
        value={title}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, title: changeValue(e) }))
        }
        size="sm"
      />
      <TextInput
        label="Updated label"
        value={updatedLabel}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, updatedLabel: changeValue(e) }))
        }
        size="sm"
      />
      <Textarea
        label="Body"
        description="Pisahkan paragraf dengan baris kosong"
        value={body}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, body: changeValue(e) }))
        }
        rows={10}
        size="sm"
      />
      <Group justify="flex-end">
        <Button
          size="xs"
          loading={saving}
          onClick={() => {
            const paragraphs = body
              .split(/\n\s*\n/)
              .map((p) => p.trim())
              .filter(Boolean);
            return onSave([
              {
                section: "legal",
                key: "privacy_title",
                value: title,
                valueType: "text",
              },
              {
                section: "legal",
                key: "privacy_updated_label",
                value: updatedLabel,
                valueType: "text",
              },
              {
                section: "legal",
                key: "privacy_body",
                value: JSON.stringify(paragraphs),
                valueType: "json",
              },
              {
                section: "legal",
                key: PRIVACY_FOOTER_LINK_KEY,
                value: showFooterLink ? "true" : "false",
                valueType: "text",
              },
            ]);
          }}
        >
          Simpan Privasi
        </Button>
      </Group>
    </Stack>
  );
}
