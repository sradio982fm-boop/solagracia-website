"use client";

import { useEffect, useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { kontakContent as fallback } from "@/data/kontak";
import type { SiteConfigMap } from "@/hooks/admin/useSiteConfig";
import type {
  KontakChannel,
  KontakFormCopy,
  KontakHotline,
} from "@/types/kontak";

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
  return config?.contact?.[key]?.value ?? "";
}

function parseArray<T>(raw: string, fallbackValue: T[]): T[] {
  if (!raw) return fallbackValue;
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) && parsed.length ? parsed : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function parseForm(raw: string): KontakFormCopy {
  if (!raw) return fallback.form;
  try {
    return { ...fallback.form, ...(JSON.parse(raw) as KontakFormCopy) };
  } catch {
    return fallback.form;
  }
}

export function KontakConfigPanel({ config, saving, onSave }: Props) {
  const [studioLabel, setStudioLabel] = useState(fallback.studioLabel);
  const [address, setAddress] = useState(fallback.address);
  const [operatingHours, setOperatingHours] = useState(fallback.operatingHours);
  const [email, setEmail] = useState(fallback.email);
  const [frequency, setFrequency] = useState(fallback.frequency);
  const [whatsappNumber, setWhatsappNumber] = useState(fallback.whatsappNumber);
  const [channels, setChannels] = useState<KontakChannel[]>(fallback.channels);
  const [hotlines, setHotlines] = useState<KontakHotline[]>(fallback.hotlines);
  const [form, setForm] = useState<KontakFormCopy>(fallback.form);

  useEffect(() => {
    setStudioLabel(read(config, "studio_label") || fallback.studioLabel);
    setAddress(read(config, "address") || fallback.address);
    setOperatingHours(
      read(config, "operating_hours") || fallback.operatingHours,
    );
    setEmail(read(config, "email") || fallback.email);
    setFrequency(read(config, "frequency") || fallback.frequency);
    setWhatsappNumber(
      read(config, "whatsapp_number") || fallback.whatsappNumber,
    );
    setChannels(parseArray(read(config, "channels"), fallback.channels));
    setHotlines(parseArray(read(config, "hotlines"), fallback.hotlines));
    setForm(parseForm(read(config, "form")));
  }, [config]);

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Header seksi diedit di Section headers → kontak. Social dari menu
        Social.
      </Text>

      <TextInput
        label="Studio label"
        value={studioLabel}
        onChange={(e) => setStudioLabel(e.currentTarget.value)}
        size="sm"
      />
      <Textarea
        label="Address"
        value={address}
        onChange={(e) => setAddress(e.currentTarget.value)}
        rows={3}
        size="sm"
      />
      <TextInput
        label="Operating hours"
        value={operatingHours}
        onChange={(e) => setOperatingHours(e.currentTarget.value)}
        size="sm"
      />
      <Group grow>
        <TextInput
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          size="sm"
        />
        <TextInput
          label="Frequency"
          description="Bisa dikosongkan — brand.frequency_label jadi fallback"
          value={frequency}
          onChange={(e) => setFrequency(e.currentTarget.value)}
          size="sm"
        />
      </Group>
      <TextInput
        label="WhatsApp number"
        description="Digits only, mis. 628811982982"
        value={whatsappNumber}
        onChange={(e) => setWhatsappNumber(e.currentTarget.value)}
        size="sm"
      />

      <Text size="xs" c="dimmed">
        Channels
      </Text>
      <Stack gap="xs">
        {channels.map((channel, index) => (
          <Stack
            key={`${channel.id}-${index}`}
            gap={6}
            p="sm"
            style={{ border: "1px solid var(--mantine-color-gray-3)" }}
          >
            <Group grow>
              <TextInput
                label="ID"
                value={channel.id}
                onChange={(e) =>
                  setChannels((prev) =>
                    prev.map((c, i) =>
                      i === index
                        ? { ...c, id: e.currentTarget.value }
                        : c,
                    ),
                  )
                }
                size="xs"
              />
              <TextInput
                label="Label"
                value={channel.label}
                onChange={(e) =>
                  setChannels((prev) =>
                    prev.map((c, i) =>
                      i === index
                        ? { ...c, label: e.currentTarget.value }
                        : c,
                    ),
                  )
                }
                size="xs"
              />
            </Group>
            <TextInput
              label="Detail"
              value={channel.detail}
              onChange={(e) =>
                setChannels((prev) =>
                  prev.map((c, i) =>
                    i === index
                      ? { ...c, detail: e.currentTarget.value }
                      : c,
                  ),
                )
              }
              size="xs"
            />
            <Group align="flex-end">
              <TextInput
                label="Href"
                value={channel.href}
                onChange={(e) =>
                  setChannels((prev) =>
                    prev.map((c, i) =>
                      i === index
                        ? { ...c, href: e.currentTarget.value }
                        : c,
                    ),
                  )
                }
                size="xs"
                style={{ flex: 1 }}
              />
              <Switch
                label="External"
                checked={Boolean(channel.external)}
                onChange={(e) =>
                  setChannels((prev) =>
                    prev.map((c, i) =>
                      i === index
                        ? { ...c, external: e.currentTarget.checked }
                        : c,
                    ),
                  )
                }
              />
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() =>
                  setChannels((prev) => prev.filter((_, i) => i !== index))
                }
                aria-label="Hapus channel"
              >
                <i className="material-icons text-[18px]">close</i>
              </ActionIcon>
            </Group>
          </Stack>
        ))}
        <Button
          size="xs"
          variant="light"
          color="gray"
          onClick={() =>
            setChannels((prev) => [
              ...prev,
              {
                id: `channel-${prev.length + 1}`,
                label: "",
                detail: "",
                href: "#",
              },
            ])
          }
        >
          Tambah channel
        </Button>
      </Stack>

      <Text size="xs" c="dimmed">
        Hotlines
      </Text>
      <Stack gap="xs">
        {hotlines.map((line, index) => (
          <Group key={index} grow align="flex-end">
            <TextInput
              label={index === 0 ? "Label" : undefined}
              value={line.label}
              onChange={(e) =>
                setHotlines((prev) =>
                  prev.map((h, i) =>
                    i === index
                      ? { ...h, label: e.currentTarget.value }
                      : h,
                  ),
                )
              }
              size="sm"
            />
            <TextInput
              label={index === 0 ? "Number" : undefined}
              value={line.number}
              onChange={(e) =>
                setHotlines((prev) =>
                  prev.map((h, i) =>
                    i === index
                      ? { ...h, number: e.currentTarget.value }
                      : h,
                  ),
                )
              }
              size="sm"
            />
            <TextInput
              label={index === 0 ? "Href" : undefined}
              value={line.href}
              onChange={(e) =>
                setHotlines((prev) =>
                  prev.map((h, i) =>
                    i === index
                      ? { ...h, href: e.currentTarget.value }
                      : h,
                  ),
                )
              }
              size="sm"
            />
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() =>
                setHotlines((prev) => prev.filter((_, i) => i !== index))
              }
              aria-label="Hapus hotline"
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
            setHotlines((prev) => [
              ...prev,
              { label: "", number: "", href: "tel:" },
            ])
          }
        >
          Tambah hotline
        </Button>
      </Stack>

      <Text size="xs" c="dimmed">
        Form copy
      </Text>
      <Group grow>
        <TextInput
          label="Name label"
          value={form.nameLabel}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, nameLabel: e.currentTarget.value }))
          }
          size="sm"
        />
        <TextInput
          label="Name placeholder"
          value={form.namePlaceholder}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              namePlaceholder: e.currentTarget.value,
            }))
          }
          size="sm"
        />
      </Group>
      <Group grow>
        <TextInput
          label="Message label"
          value={form.messageLabel}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              messageLabel: e.currentTarget.value,
            }))
          }
          size="sm"
        />
        <TextInput
          label="Message placeholder"
          value={form.messagePlaceholder}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              messagePlaceholder: e.currentTarget.value,
            }))
          }
          size="sm"
        />
      </Group>
      <TextInput
        label="Submit label"
        value={form.submitLabel}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, submitLabel: e.currentTarget.value }))
        }
        size="sm"
      />
      <Textarea
        label="WhatsApp template"
        description="Gunakan {name} dan {message}"
        value={form.whatsappTemplate}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            whatsappTemplate: e.currentTarget.value,
          }))
        }
        rows={3}
        size="sm"
      />

      <Group justify="flex-end">
        <Button
          size="xs"
          loading={saving}
          onClick={() =>
            onSave([
              {
                section: "contact",
                key: "studio_label",
                value: studioLabel,
                valueType: "text",
              },
              {
                section: "contact",
                key: "address",
                value: address,
                valueType: "text",
              },
              {
                section: "contact",
                key: "operating_hours",
                value: operatingHours,
                valueType: "text",
              },
              {
                section: "contact",
                key: "email",
                value: email,
                valueType: "text",
              },
              {
                section: "contact",
                key: "frequency",
                value: frequency,
                valueType: "text",
              },
              {
                section: "contact",
                key: "whatsapp_number",
                value: whatsappNumber,
                valueType: "text",
              },
              {
                section: "contact",
                key: "channels",
                value: JSON.stringify(
                  channels.filter((c) => c.id && c.label && c.href),
                ),
                valueType: "json",
              },
              {
                section: "contact",
                key: "hotlines",
                value: JSON.stringify(
                  hotlines.filter((h) => h.label && h.number),
                ),
                valueType: "json",
              },
              {
                section: "contact",
                key: "form",
                value: JSON.stringify(form),
                valueType: "json",
              },
            ])
          }
        >
          Simpan Kontak
        </Button>
      </Group>
    </Stack>
  );
}
