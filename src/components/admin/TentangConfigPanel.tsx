"use client";

import { useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import type { SiteConfigMap } from "@/hooks/admin/useSiteConfig";
import {
  mapCmsReel,
  reelToCms,
  type CmsInstagramReel,
} from "@/lib/tentang";
import { tentangContent as fallback } from "@/data/tentang";
import type { TentangCta, TentangStat } from "@/types/site";
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

type FormState = {
  headline: string;
  headlineAccent: string;
  body: string;
  stats: TentangStat[];
  ctas: TentangCta[];
  socialLabel: string;
  reel: CmsInstagramReel;
};

function read(config: SiteConfigMap | undefined, key: string): string {
  return config?.tentang?.[key]?.value ?? "";
}

function parseStats(raw: string): TentangStat[] {
  if (!raw) return fallback.stats;
  try {
    const parsed = JSON.parse(raw) as TentangStat[];
    return Array.isArray(parsed) ? parsed : fallback.stats;
  } catch {
    return fallback.stats;
  }
}

function parseCtas(raw: string): TentangCta[] {
  if (!raw) return fallback.ctas;
  try {
    const parsed = JSON.parse(raw) as TentangCta[];
    return Array.isArray(parsed) ? parsed : fallback.ctas;
  } catch {
    return fallback.ctas;
  }
}

function parseBody(raw: string): string {
  if (raw === "") return "";
  if (!raw) return fallback.body.join("\n\n");
  try {
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) return parsed.join("\n\n");
  } catch {
    /* plain text */
  }
  return raw;
}

function parseReel(raw: string, legacyTestimonial: string): CmsInstagramReel {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as CmsInstagramReel;
      return reelToCms(mapCmsReel(parsed));
    } catch {
      /* fall through */
    }
  }
  if (legacyTestimonial) {
    try {
      const parsed = JSON.parse(legacyTestimonial) as { href?: string };
      return reelToCms(mapCmsReel(parsed));
    } catch {
      /* fall through */
    }
  }
  return reelToCms(fallback.reel);
}

function formFromConfig(config: SiteConfigMap | undefined): FormState {
  return {
    headline: read(config, "headline") || fallback.headline,
    headlineAccent:
      read(config, "headline_accent") || fallback.headlineAccent,
    body: parseBody(read(config, "body")),
    stats: parseStats(read(config, "stats")),
    ctas: parseCtas(read(config, "ctas")),
    socialLabel: read(config, "social_label") || fallback.socialLabel,
    reel: parseReel(
      read(config, "instagram_reel"),
      read(config, "testimonial"),
    ),
  };
}

export function TentangConfigPanel({ config, saving, onSave }: Props) {
  const [form, setForm] = useState(() => formFromConfig(config));
  const [configRef, setConfigRef] = useState(config);

  // Reset local draft when CMS config identity changes (avoids setState-in-effect).
  if (config !== configRef) {
    setConfigRef(config);
    setForm(formFromConfig(config));
  }

  const { headline, headlineAccent, body, stats, ctas, socialLabel, reel } =
    form;

  return (
    <Stack gap="md">
      <TextInput
        label="Headline"
        value={headline}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, headline: changeValue(e) }))
        }
        size="sm"
      />
      <TextInput
        label="Headline accent"
        value={headlineAccent}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, headlineAccent: changeValue(e) }))
        }
        size="sm"
      />

      <div>
        <Text size="xs" c="dimmed" mb={6}>
          Stats
        </Text>
        <Stack gap="xs">
          {stats.map((stat, index) => (
            <Group key={index} grow align="flex-end">
              <TextInput
                label={index === 0 ? "Value" : undefined}
                value={stat.value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    stats: prev.stats.map((s, i) =>
                      i === index
                        ? { ...s, value: changeValue(e) }
                        : s,
                    ),
                  }))
                }
                size="sm"
              />
              <TextInput
                label={index === 0 ? "Label" : undefined}
                value={stat.label}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    stats: prev.stats.map((s, i) =>
                      i === index
                        ? { ...s, label: changeValue(e) }
                        : s,
                    ),
                  }))
                }
                size="sm"
              />
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    stats: prev.stats.filter((_, i) => i !== index),
                  }))
                }
                aria-label="Hapus stat"
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
              setForm((prev) => ({
                ...prev,
                stats: [...prev.stats, { value: "", label: "" }],
              }))
            }
          >
            Tambah stat
          </Button>
        </Stack>
      </div>

      <Textarea
        label="Body"
        description="Enter = baris baru dalam paragraf. Baris kosong = paragraf baru."
        value={body}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, body: changeValue(e) }))
        }
        rows={6}
        size="sm"
      />

      <div>
        <Text size="xs" c="dimmed" mb={6}>
          CTAs
        </Text>
        <Stack gap="xs">
          {ctas.map((cta, index) => (
            <Group key={index} grow align="flex-end">
              <TextInput
                label={index === 0 ? "Label" : undefined}
                value={cta.label}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ctas: prev.ctas.map((c, i) =>
                      i === index
                        ? { ...c, label: changeValue(e) }
                        : c,
                    ),
                  }))
                }
                size="sm"
              />
              <TextInput
                label={index === 0 ? "Href" : undefined}
                value={cta.href}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ctas: prev.ctas.map((c, i) =>
                      i === index
                        ? { ...c, href: changeValue(e) }
                        : c,
                    ),
                  }))
                }
                size="sm"
              />
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    ctas: prev.ctas.filter((_, i) => i !== index),
                  }))
                }
                disabled={ctas.length <= 1}
                aria-label="Hapus CTA"
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
              setForm((prev) => ({
                ...prev,
                ctas: [
                  ...prev.ctas,
                  { label: "", href: "#", variant: "ghost" },
                ],
              }))
            }
          >
            Tambah CTA
          </Button>
        </Stack>
      </div>

      <TextInput
        label="Label di atas Reel"
        value={socialLabel}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, socialLabel: changeValue(e) }))
        }
        size="sm"
      />
      <TextInput
        label="Instagram Reel URL"
        description="Hanya URL Reel (contoh: https://www.instagram.com/reel/...). Kosongkan untuk menyembunyikan embed."
        value={reel.href}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            reel: { href: changeValue(e) },
          }))
        }
        size="sm"
      />

      <Group justify="flex-end">
        <Button
          size="xs"
          loading={saving}
          onClick={() => {
            // Blank line → new paragraph; single Enter stays as \n (rendered as <br>).
            const bodyParagraphs = body
              .split(/\n\s*\n/)
              .map((p) => p.replace(/^\s+|\s+$/g, ""))
              .filter(Boolean);

            return onSave([
              {
                section: "tentang",
                key: "headline",
                value: headline,
                valueType: "text",
              },
              {
                section: "tentang",
                key: "headline_accent",
                value: headlineAccent,
                valueType: "text",
              },
              {
                section: "tentang",
                key: "body",
                value: JSON.stringify(bodyParagraphs),
                valueType: "json",
              },
              {
                section: "tentang",
                key: "stats",
                value: JSON.stringify(
                  stats.filter((s) => s.value.trim() && s.label.trim()),
                ),
                valueType: "json",
              },
              {
                section: "tentang",
                key: "ctas",
                value: JSON.stringify(
                  ctas
                    .filter((c) => c.label.trim() && c.href.trim())
                    .map((c) => ({
                      label: c.label,
                      href: c.href,
                      variant: c.variant || "ghost",
                    })),
                ),
                valueType: "json",
              },
              {
                section: "tentang",
                key: "social_label",
                value: socialLabel,
                valueType: "text",
              },
              {
                section: "tentang",
                key: "instagram_reel",
                value: JSON.stringify({
                  href: reel.href.trim(),
                }),
                valueType: "json",
              },
            ]);
          }}
        >
          Simpan Tentang
        </Button>
      </Group>
    </Stack>
  );
}
