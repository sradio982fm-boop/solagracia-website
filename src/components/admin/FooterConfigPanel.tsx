"use client";

import { useEffect, useState } from "react";
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
import type { SiteConfigMap } from "@/hooks/admin/useSiteConfig";
import type { FooterLink } from "@/types/site";

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

function read(
  config: SiteConfigMap | undefined,
  section: string,
  key: string,
): string {
  return config?.[section]?.[key]?.value ?? "";
}

function parseLegal(raw: string): FooterLink[] {
  if (!raw) return fallback.legalLinks;
  try {
    const parsed = JSON.parse(raw) as FooterLink[];
    return Array.isArray(parsed) && parsed.length
      ? parsed
      : fallback.legalLinks;
  } catch {
    return fallback.legalLinks;
  }
}

function parseMarquee(raw: string): string {
  if (!raw) return fallbackMarquee.join("\n");
  try {
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) return parsed.join("\n");
  } catch {
    /* plain */
  }
  return raw;
}

export function FooterConfigPanel({ config, saving, onSave }: Props) {
  const [brandTitle, setBrandTitle] = useState(fallback.brandTitle);
  const [brandDescription, setBrandDescription] = useState(
    fallback.brandDescription,
  );
  const [copyrightText, setCopyrightText] = useState(fallback.copyrightText);
  const [listenLabel, setListenLabel] = useState(fallback.listenLabel);
  const [listenHref, setListenHref] = useState(fallback.listenHref);
  const [contactLabel, setContactLabel] = useState(fallback.contactLabel);
  const [contactHref, setContactHref] = useState(fallback.contactHref);
  const [columnIkuti, setColumnIkuti] = useState(fallback.columnIkuti);
  const [columnJelajahi, setColumnJelajahi] = useState(fallback.columnJelajahi);
  const [wordmark, setWordmark] = useState(fallback.wordmark);
  const [wordmarkSub, setWordmarkSub] = useState(fallback.wordmarkSub);
  const [legalLinks, setLegalLinks] = useState<FooterLink[]>(
    fallback.legalLinks,
  );
  const [marquee, setMarquee] = useState(fallbackMarquee.join("\n"));

  useEffect(() => {
    setBrandTitle(
      (read(config, "footer", "brand_title") || fallback.brandTitle).replace(
        /\\n/g,
        "\n",
      ),
    );
    setBrandDescription(
      read(config, "footer", "brand_description") || fallback.brandDescription,
    );
    setCopyrightText(
      read(config, "footer", "copyright_text") || fallback.copyrightText,
    );
    setListenLabel(
      read(config, "footer", "listen_label") || fallback.listenLabel,
    );
    setListenHref(read(config, "footer", "listen_href") || fallback.listenHref);
    setContactLabel(
      read(config, "footer", "contact_label") || fallback.contactLabel,
    );
    setContactHref(
      read(config, "footer", "contact_href") || fallback.contactHref,
    );
    setColumnIkuti(
      read(config, "footer", "column_ikuti") || fallback.columnIkuti,
    );
    setColumnJelajahi(
      read(config, "footer", "column_jelajahi") || fallback.columnJelajahi,
    );
    setWordmark(read(config, "footer", "wordmark") || fallback.wordmark);
    setWordmarkSub(
      read(config, "footer", "wordmark_sub") || fallback.wordmarkSub,
    );
    setLegalLinks(parseLegal(read(config, "footer", "legal_links")));
    setMarquee(parseMarquee(read(config, "marquee", "items")));
  }, [config]);

  return (
    <Stack gap="md">
      <Textarea
        label="Brand title"
        description="Gunakan baris baru untuk pecah baris"
        value={brandTitle}
        onChange={(e) => setBrandTitle(e.currentTarget.value)}
        rows={3}
        size="sm"
      />
      <Textarea
        label="Brand description"
        value={brandDescription}
        onChange={(e) => setBrandDescription(e.currentTarget.value)}
        rows={3}
        size="sm"
      />
      <TextInput
        label="Copyright"
        description="Gunakan {year} untuk tahun dinamis"
        value={copyrightText}
        onChange={(e) => setCopyrightText(e.currentTarget.value)}
        size="sm"
      />
      <Group grow>
        <TextInput
          label="Listen label"
          value={listenLabel}
          onChange={(e) => setListenLabel(e.currentTarget.value)}
          size="sm"
        />
        <TextInput
          label="Listen href"
          value={listenHref}
          onChange={(e) => setListenHref(e.currentTarget.value)}
          size="sm"
        />
      </Group>
      <Group grow>
        <TextInput
          label="Contact label"
          value={contactLabel}
          onChange={(e) => setContactLabel(e.currentTarget.value)}
          size="sm"
        />
        <TextInput
          label="Contact href"
          value={contactHref}
          onChange={(e) => setContactHref(e.currentTarget.value)}
          size="sm"
        />
      </Group>
      <Group grow>
        <TextInput
          label="Column Ikuti"
          value={columnIkuti}
          onChange={(e) => setColumnIkuti(e.currentTarget.value)}
          size="sm"
        />
        <TextInput
          label="Column Jelajahi"
          value={columnJelajahi}
          onChange={(e) => setColumnJelajahi(e.currentTarget.value)}
          size="sm"
        />
      </Group>
      <Group grow>
        <TextInput
          label="Wordmark"
          value={wordmark}
          onChange={(e) => setWordmark(e.currentTarget.value)}
          size="sm"
        />
        <TextInput
          label="Wordmark sub"
          value={wordmarkSub}
          onChange={(e) => setWordmarkSub(e.currentTarget.value)}
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
                setLegalLinks((prev) =>
                  prev.map((l, i) =>
                    i === index
                      ? { ...l, label: e.currentTarget.value }
                      : l,
                  ),
                )
              }
              size="sm"
            />
            <TextInput
              label={index === 0 ? "Href" : undefined}
              value={link.href}
              onChange={(e) =>
                setLegalLinks((prev) =>
                  prev.map((l, i) =>
                    i === index
                      ? { ...l, href: e.currentTarget.value }
                      : l,
                  ),
                )
              }
              size="sm"
            />
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() =>
                setLegalLinks((prev) => prev.filter((_, i) => i !== index))
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
            setLegalLinks((prev) => [...prev, { label: "", href: "#" }])
          }
        >
          Tambah legal link
        </Button>
      </Stack>

      <Textarea
        label="Radio marquee items"
        description="Satu item per baris"
        value={marquee}
        onChange={(e) => setMarquee(e.currentTarget.value)}
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
