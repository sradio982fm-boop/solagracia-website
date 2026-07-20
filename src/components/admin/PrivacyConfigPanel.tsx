"use client";

import { useEffect, useState } from "react";
import { Button, Group, Stack, Text, Textarea, TextInput } from "@mantine/core";
import type { SiteConfigMap } from "@/hooks/admin/useSiteConfig";
import { FALLBACK_PRIVACY } from "@/lib/legal";
import { changeValue } from "@/lib/admin/form";

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

function read(config: SiteConfigMap | undefined, key: string): string {
  return config?.legal?.[key]?.value ?? "";
}

function parseBody(raw: string): string {
  if (!raw) return FALLBACK_PRIVACY.body.join("\n\n");
  try {
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) return parsed.join("\n\n");
  } catch {
    /* plain */
  }
  return raw;
}

export function PrivacyConfigPanel({ config, saving, onSave }: Props) {
  const [title, setTitle] = useState(FALLBACK_PRIVACY.title);
  const [updatedLabel, setUpdatedLabel] = useState(FALLBACK_PRIVACY.updatedLabel);
  const [body, setBody] = useState(FALLBACK_PRIVACY.body.join("\n\n"));

  useEffect(() => {
    setTitle(read(config, "privacy_title") || FALLBACK_PRIVACY.title);
    setUpdatedLabel(
      read(config, "privacy_updated_label") || FALLBACK_PRIVACY.updatedLabel,
    );
    setBody(parseBody(read(config, "privacy_body")));
  }, [config]);

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Konten halaman publik /privasi.
      </Text>
      <TextInput
        label="Title"
        value={title}
        onChange={(e) => setTitle(changeValue(e))}
        size="sm"
      />
      <TextInput
        label="Updated label"
        value={updatedLabel}
        onChange={(e) => setUpdatedLabel(changeValue(e))}
        size="sm"
      />
      <Textarea
        label="Body"
        description="Pisahkan paragraf dengan baris kosong"
        value={body}
        onChange={(e) => setBody(changeValue(e))}
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
            ]);
          }}
        >
          Simpan Privasi
        </Button>
      </Group>
    </Stack>
  );
}
