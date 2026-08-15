"use client";

import {
  ActionIcon,
  Button,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { footerContent as fallback } from "@/data/footer";
import { marqueeItems as fallbackMarquee } from "@/data/marquee";
import { configJsonArray, configText } from "@/lib/cms-parse";
import type { SiteConfigMap } from "@/hooks/admin/useSiteConfig";
import type { FooterLink } from "@/types/site";
import { changeValue } from "@/lib/admin/form";
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

function field(
  config: SiteConfigMap | undefined,
  section: string,
  key: string,
  fallbackValue: string,
): string {
  return configText(config?.[section], key, fallbackValue);
}

function parseLegal(config: SiteConfigMap | undefined): FooterLink[] {
  return configJsonArray<FooterLink>(
    config?.footer,
    "legal_links",
    fallback.legalLinks,
  );
}

function parseMarquee(config: SiteConfigMap | undefined): string {
  const entry = config?.marquee?.items;
  if (entry === undefined) return fallbackMarquee.join("\n");
  const raw = entry.value ?? "";
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) return parsed.join("\n");
  } catch {
    /* plain text */
  }
  return raw;
}

type FooterDraft = {
  brandTitle: string;
  brandDescription: string;
  copyrightText: string;
  listenLabel: string;
  listenHref: string;
  contactLabel: string;
  contactHref: string;
  columnIkuti: string;
  columnJelajahi: string;
  wordmark: string;
  wordmarkSub: string;
  legalLinks: FooterLink[];
  marquee: string;
};

function draftFromConfig(config: SiteConfigMap | undefined): FooterDraft {
  return {
    brandTitle: field(config, "footer", "brand_title", fallback.brandTitle).replace(
      /\\n/g,
      "\n",
    ),
    brandDescription: field(
      config,
      "footer",
      "brand_description",
      fallback.brandDescription,
    ),
    copyrightText: field(
      config,
      "footer",
      "copyright_text",
      fallback.copyrightText,
    ),
    listenLabel: field(config, "footer", "listen_label", fallback.listenLabel),
    listenHref: field(config, "footer", "listen_href", fallback.listenHref),
    contactLabel: field(config, "footer", "contact_label", fallback.contactLabel),
    contactHref: field(config, "footer", "contact_href", fallback.contactHref),
    columnIkuti: field(config, "footer", "column_ikuti", fallback.columnIkuti),
    columnJelajahi: field(
      config,
      "footer",
      "column_jelajahi",
      fallback.columnJelajahi,
    ),
    wordmark: field(config, "footer", "wordmark", fallback.wordmark),
    wordmarkSub: field(config, "footer", "wordmark_sub", fallback.wordmarkSub),
    legalLinks: parseLegal(config),
    marquee: parseMarquee(config),
  };
}

export function FooterConfigPanel({ config, saving, onSave }: Props) {
  const [draft, setDraft] = useDraftFromSource(config, draftFromConfig);
  const {
    brandTitle,
    brandDescription,
    copyrightText,
    listenLabel,
    listenHref,
    contactLabel,
    contactHref,
    columnIkuti,
    columnJelajahi,
    wordmark,
    wordmarkSub,
    legalLinks,
    marquee,
  } = draft;

  return (
    <Stack gap="md">
      <Textarea
        label="Brand title"
        description="Gunakan baris baru untuk pecah baris"
        value={brandTitle}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, brandTitle: changeValue(e) }))
        }
        rows={3}
        size="sm"
      />
      <Textarea
        label="Brand description"
        value={brandDescription}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, brandDescription: changeValue(e) }))
        }
        rows={3}
        size="sm"
      />
      <TextInput
        label="Copyright"
        description="Gunakan {year} untuk tahun dinamis"
        value={copyrightText}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, copyrightText: changeValue(e) }))
        }
        size="sm"
      />
      <Group grow>
        <TextInput
          label="Listen label"
          value={listenLabel}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, listenLabel: changeValue(e) }))
          }
          size="sm"
        />
        <TextInput
          label="Listen href"
          value={listenHref}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, listenHref: changeValue(e) }))
          }
          size="sm"
        />
      </Group>
      <Group grow>
        <TextInput
          label="Contact label"
          value={contactLabel}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, contactLabel: changeValue(e) }))
          }
          size="sm"
        />
        <TextInput
          label="Contact href"
          value={contactHref}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, contactHref: changeValue(e) }))
          }
          size="sm"
        />
      </Group>
      <Group grow>
        <TextInput
          label="Column Ikuti"
          value={columnIkuti}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, columnIkuti: changeValue(e) }))
          }
          size="sm"
        />
        <TextInput
          label="Column Jelajahi"
          value={columnJelajahi}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, columnJelajahi: changeValue(e) }))
          }
          size="sm"
        />
      </Group>
      <Group grow>
        <TextInput
          label="Wordmark"
          value={wordmark}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, wordmark: changeValue(e) }))
          }
          size="sm"
        />
        <TextInput
          label="Wordmark sub"
          value={wordmarkSub}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, wordmarkSub: changeValue(e) }))
          }
          size="sm"
        />
      </Group>

      <Text size="xs" c="dimmed">
        Legal links
      </Text>
      <Stack gap="xs">
        {legalLinks.map((link, index) => (
          <Group key={index} grow align="flex-end">
            <TextInput
              label={index === 0 ? "Label" : undefined}
              value={link.label}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  legalLinks: prev.legalLinks.map((l, i) =>
                    i === index
                      ? { ...l, label: changeValue(e) }
                      : l,
                  ),
                }))
              }
              size="sm"
            />
            <TextInput
              label={index === 0 ? "Href" : undefined}
              value={link.href}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  legalLinks: prev.legalLinks.map((l, i) =>
                    i === index
                      ? { ...l, href: changeValue(e) }
                      : l,
                  ),
                }))
              }
              size="sm"
            />
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  legalLinks: prev.legalLinks.filter((_, i) => i !== index),
                }))
              }
              aria-label="Hapus legal link"
            >
              <i className="material-icons text-[18px]">close</i>
            </ActionIcon>
          </Group>
        ))}
        <Button
          size="xs"
          variant="light"
          color="gray"
          onClick={() =>
            setDraft((prev) => ({
              ...prev,
              legalLinks: [...prev.legalLinks, { label: "", href: "#" }],
            }))
          }
        >
          Tambah legal link
        </Button>
      </Stack>

      <Textarea
        label="Radio marquee items"
        description="Satu item per baris"
        value={marquee}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, marquee: changeValue(e) }))
        }
        rows={8}
        size="sm"
      />

      <Text size="xs" c="dimmed">
        Social footer dari menu Social. Explore links dari navigasi seksi.
      </Text>

      <Group justify="flex-end">
        <Button
          size="xs"
          loading={saving}
          onClick={() => {
            const marqueeItems = marquee
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean);

            return onSave([
              {
                section: "footer",
                key: "brand_title",
                value: brandTitle.replace(/\n/g, "\\n"),
                valueType: "text",
              },
              {
                section: "footer",
                key: "brand_description",
                value: brandDescription,
                valueType: "text",
              },
              {
                section: "footer",
                key: "copyright_text",
                value: copyrightText,
                valueType: "text",
              },
              {
                section: "footer",
                key: "listen_label",
                value: listenLabel,
                valueType: "text",
              },
              {
                section: "footer",
                key: "listen_href",
                value: listenHref,
                valueType: "url",
              },
              {
                section: "footer",
                key: "contact_label",
                value: contactLabel,
                valueType: "text",
              },
              {
                section: "footer",
                key: "contact_href",
                value: contactHref,
                valueType: "url",
              },
              {
                section: "footer",
                key: "column_ikuti",
                value: columnIkuti,
                valueType: "text",
              },
              {
                section: "footer",
                key: "column_jelajahi",
                value: columnJelajahi,
                valueType: "text",
              },
              {
                section: "footer",
                key: "wordmark",
                value: wordmark,
                valueType: "text",
              },
              {
                section: "footer",
                key: "wordmark_sub",
                value: wordmarkSub,
                valueType: "text",
              },
              {
                section: "footer",
                key: "legal_links",
                value: JSON.stringify(
                  legalLinks.filter((l) => l.label && l.href),
                ),
                valueType: "json",
              },
              {
                section: "marquee",
                key: "items",
                value: JSON.stringify(marqueeItems),
                valueType: "json",
              },
            ]);
          }}
        >
          Simpan Footer & Marquee
        </Button>
      </Group>
    </Stack>
  );
}
