"use client";

import { useEffect, useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import type { SiteConfigMap } from "@/hooks/admin/useSiteConfig";
import {
  mapCmsTestimonial,
  testimonialToCms,
  type CmsTentangTestimonial,
} from "@/lib/tentang";
import { tentangContent as fallback } from "@/data/tentang";
import type { SocialQuotePart, TentangCta, TentangStat } from "@/types/site";
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
  return config?.tentang?.[key]?.value ?? "";
}

function parseStats(raw: string): TentangStat[] {
  try {
    const parsed = JSON.parse(raw) as TentangStat[];
    return Array.isArray(parsed) && parsed.length
      ? parsed
      : fallback.stats;
  } catch {
    return fallback.stats;
  }
}

function parseCtas(raw: string): TentangCta[] {
  try {
    const parsed = JSON.parse(raw) as TentangCta[];
    return Array.isArray(parsed) && parsed.length ? parsed : fallback.ctas;
  } catch {
    return fallback.ctas;
  }
}

function parseBody(raw: string): string {
  if (!raw) return fallback.body.join("\n\n");
  try {
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) return parsed.join("\n\n");
  } catch {
    /* plain text */
  }
  return raw;
}

function parseTestimonial(raw: string): CmsTentangTestimonial {
  if (!raw) return testimonialToCms(fallback.testimonial);
  try {
    const parsed = JSON.parse(raw) as CmsTentangTestimonial;
    return testimonialToCms(mapCmsTestimonial(parsed));
  } catch {
    return testimonialToCms(fallback.testimonial);
  }
}

function emptyQuotePart(type: SocialQuotePart["type"]): SocialQuotePart {
  if (type === "link") return { type: "link", value: "", href: "" };
  if (type === "mention") return { type: "mention", value: "@" };
  return { type: "text", value: "" };
}

export function TentangConfigPanel({ config, saving, onSave }: Props) {
  const [headline, setHeadline] = useState("");
  const [headlineAccent, setHeadlineAccent] = useState("");
  const [body, setBody] = useState("");
  const [stats, setStats] = useState<TentangStat[]>(fallback.stats);
  const [ctas, setCtas] = useState<TentangCta[]>(fallback.ctas);
  const [socialLabel, setSocialLabel] = useState("");
  const [testimonial, setTestimonial] = useState<CmsTentangTestimonial>(
    testimonialToCms(fallback.testimonial),
  );

  useEffect(() => {
    setHeadline(read(config, "headline") || fallback.headline);
    setHeadlineAccent(
      read(config, "headline_accent") || fallback.headlineAccent,
    );
    setBody(parseBody(read(config, "body")));
    setStats(parseStats(read(config, "stats")));
    setCtas(parseCtas(read(config, "ctas")));
    setSocialLabel(read(config, "social_label") || fallback.socialLabel);
    setTestimonial(parseTestimonial(read(config, "testimonial")));
  }, [config]);

  return (
    <Stack gap="md">
      <TextInput
        label="Headline"
        value={headline}
        onChange={(e) => setHeadline(changeValue(e))}
        size="sm"
      />
      <TextInput
        label="Headline accent"
        value={headlineAccent}
        onChange={(e) => setHeadlineAccent(changeValue(e))}
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
                  setStats((prev) =>
                    prev.map((s, i) =>
                      i === index
                        ? { ...s, value: changeValue(e) }
                        : s,
                    ),
                  )
                }
                size="sm"
              />
              <TextInput
                label={index === 0 ? "Label" : undefined}
                value={stat.label}
                onChange={(e) =>
                  setStats((prev) =>
                    prev.map((s, i) =>
                      i === index
                        ? { ...s, label: changeValue(e) }
                        : s,
                    ),
                  )
                }
                size="sm"
              />
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() =>
                  setStats((prev) => prev.filter((_, i) => i !== index))
                }
                disabled={stats.length <= 1}
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
              setStats((prev) => [...prev, { value: "", label: "" }])
            }
          >
            Tambah stat
          </Button>
        </Stack>
      </div>

      <Textarea
        label="Body"
        description="Pisahkan paragraf dengan baris kosong"
        value={body}
        onChange={(e) => setBody(changeValue(e))}
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
                  setCtas((prev) =>
                    prev.map((c, i) =>
                      i === index
                        ? { ...c, label: changeValue(e) }
                        : c,
                    ),
                  )
                }
                size="sm"
              />
              <TextInput
                label={index === 0 ? "Href" : undefined}
                value={cta.href}
                onChange={(e) =>
                  setCtas((prev) =>
                    prev.map((c, i) =>
                      i === index
                        ? { ...c, href: changeValue(e) }
                        : c,
                    ),
                  )
                }
                size="sm"
              />
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() =>
                  setCtas((prev) => prev.filter((_, i) => i !== index))
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
              setCtas((prev) => [
                ...prev,
                { label: "", href: "#", variant: "ghost" },
              ])
            }
          >
            Tambah CTA
          </Button>
        </Stack>
      </div>

      <TextInput
        label="Social proof label"
        value={socialLabel}
        onChange={(e) => setSocialLabel(changeValue(e))}
        size="sm"
      />

      <Text size="xs" c="dimmed">
        Social media post
      </Text>
      <Select
        label="Platform"
        data={[
          { value: "x", label: "X" },
          { value: "threads", label: "Threads" },
        ]}
        value={testimonial.platform}
        onChange={(value) =>
          setTestimonial((prev) => ({
            ...prev,
            platform: value === "threads" ? "threads" : "x",
          }))
        }
        size="sm"
      />
      <TextInput
        label="Date"
        value={testimonial.date}
        onChange={(e) =>
          setTestimonial((prev) => ({
            ...prev,
            date: changeValue(e),
          }))
        }
        size="sm"
      />
      <div>
        <Text size="xs" c="dimmed" mb={6}>
          Quote parts (teks / mention / link)
        </Text>
        <Stack gap="xs">
          {(testimonial.quote || []).map((part, index) => (
            <Stack
              key={index}
              gap={6}
              p="sm"
              style={{ border: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Group grow align="flex-end">
                <Select
                  label="Tipe"
                  data={[
                    { value: "text", label: "Text" },
                    { value: "mention", label: "Mention" },
                    { value: "link", label: "Link" },
                  ]}
                  value={part.type}
                  onChange={(value) => {
                    const type = (value || "text") as SocialQuotePart["type"];
                    setTestimonial((prev) => ({
                      ...prev,
                      quote: (prev.quote || []).map((p, i) =>
                        i === index ? emptyQuotePart(type) : p,
                      ),
                    }));
                  }}
                  size="xs"
                />
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() =>
                    setTestimonial((prev) => ({
                      ...prev,
                      quote: (prev.quote || []).filter((_, i) => i !== index),
                    }))
                  }
                  disabled={(testimonial.quote || []).length <= 1}
                  aria-label="Hapus part"
                >
                  <i className="material-icons text-[18px]">close</i>
                </ActionIcon>
              </Group>
              <TextInput
                label={part.type === "mention" ? "Mention" : "Teks"}
                value={part.value}
                onChange={(e) =>
                  setTestimonial((prev) => ({
                    ...prev,
                    quote: (prev.quote || []).map((p, i) =>
                      i === index
                        ? { ...p, value: changeValue(e) }
                        : p,
                    ),
                  }))
                }
                size="xs"
              />
              {part.type === "link" ? (
                <TextInput
                  label="Href"
                  value={part.href}
                  onChange={(e) =>
                    setTestimonial((prev) => ({
                      ...prev,
                      quote: (prev.quote || []).map((p, i) =>
                        i === index && p.type === "link"
                          ? { ...p, href: changeValue(e) }
                          : p,
                      ),
                    }))
                  }
                  size="xs"
                />
              ) : null}
            </Stack>
          ))}
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="gray"
              onClick={() =>
                setTestimonial((prev) => ({
                  ...prev,
                  quote: [...(prev.quote || []), emptyQuotePart("text")],
                }))
              }
            >
              + Text
            </Button>
            <Button
              size="xs"
              variant="light"
              color="gray"
              onClick={() =>
                setTestimonial((prev) => ({
                  ...prev,
                  quote: [...(prev.quote || []), emptyQuotePart("mention")],
                }))
              }
            >
              + Mention
            </Button>
            <Button
              size="xs"
              variant="light"
              color="gray"
              onClick={() =>
                setTestimonial((prev) => ({
                  ...prev,
                  quote: [...(prev.quote || []), emptyQuotePart("link")],
                }))
              }
            >
              + Link
            </Button>
          </Group>
        </Stack>
      </div>
      <Group grow>
        <TextInput
          label="Author name"
          value={testimonial.authorName}
          onChange={(e) =>
            setTestimonial((prev) => ({
              ...prev,
              authorName: changeValue(e),
            }))
          }
          size="sm"
        />
        <TextInput
          label="Author handle"
          value={testimonial.authorHandle}
          onChange={(e) =>
            setTestimonial((prev) => ({
              ...prev,
              authorHandle: changeValue(e),
            }))
          }
          size="sm"
        />
        <TextInput
          label="Initials"
          value={testimonial.authorInitials}
          onChange={(e) =>
            setTestimonial((prev) => ({
              ...prev,
              authorInitials: changeValue(e),
            }))
          }
          size="sm"
        />
      </Group>
      <TextInput
        label="Post / profile link"
        value={testimonial.href}
        onChange={(e) =>
          setTestimonial((prev) => ({
            ...prev,
            href: changeValue(e),
          }))
        }
        size="sm"
      />

      <Group justify="flex-end">
        <Button
          size="xs"
          loading={saving}
          onClick={() => {
            const bodyParagraphs = body
              .split(/\n\s*\n/)
              .map((p) => p.trim())
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
                key: "testimonial",
                value: JSON.stringify({
                  platform: testimonial.platform,
                  date: testimonial.date,
                  quote: (testimonial.quote || []).filter((part) => {
                    if (part.type === "link") {
                      return part.value.trim() && part.href.trim();
                    }
                    return part.value.trim();
                  }),
                  authorName: testimonial.authorName,
                  authorHandle: testimonial.authorHandle,
                  authorInitials: testimonial.authorInitials,
                  href: testimonial.href,
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
