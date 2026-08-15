"use client";

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
import { configJsonArray, configText } from "@/lib/cms-parse";
import type { SiteConfigMap } from "@/hooks/admin/useSiteConfig";
import type {
  KontakChannel,
  KontakFormCopy,
  KontakHotline,
} from "@/types/kontak";
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

function parseFormFromConfig(config: SiteConfigMap | undefined): KontakFormCopy {
  const entry = config?.contact?.form;
  if (entry === undefined) return fallback.form;
  const raw = entry.value ?? "";
  if (!raw) {
    return {
      nameLabel: "",
      namePlaceholder: "",
      messageLabel: "",
      messagePlaceholder: "",
      submitLabel: "",
      whatsappTemplate: "",
    };
  }
  try {
    return { ...fallback.form, ...(JSON.parse(raw) as KontakFormCopy) };
  } catch {
    return fallback.form;
  }
}

type KontakDraft = {
  studioLabel: string;
  address: string;
  operatingHours: string;
  email: string;
  frequency: string;
  whatsappNumber: string;
  channels: KontakChannel[];
  hotlines: KontakHotline[];
  form: KontakFormCopy;
};

function draftFromConfig(config: SiteConfigMap | undefined): KontakDraft {
  return {
    studioLabel: configText(
      config?.contact,
      "studio_label",
      fallback.studioLabel,
    ),
    address: configText(config?.contact, "address", fallback.address),
    operatingHours: configText(
      config?.contact,
      "operating_hours",
      fallback.operatingHours,
    ),
    email: configText(config?.contact, "email", fallback.email),
    frequency: configText(config?.contact, "frequency", fallback.frequency),
    whatsappNumber: configText(
      config?.contact,
      "whatsapp_number",
      fallback.whatsappNumber,
    ),
    channels: configJsonArray(config?.contact, "channels", fallback.channels),
    hotlines: configJsonArray(config?.contact, "hotlines", fallback.hotlines),
    form: parseFormFromConfig(config),
  };
}

export function KontakConfigPanel({ config, saving, onSave }: Props) {
  const [draft, setDraft] = useDraftFromSource(config, draftFromConfig);
  const {
    studioLabel,
    address,
    operatingHours,
    email,
    frequency,
    whatsappNumber,
    channels,
    hotlines,
    form,
  } = draft;

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        Header seksi diedit di Section headers → kontak. Social dari menu
        Social.
      </Text>

      <TextInput
        label="Studio label"
        value={studioLabel}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, studioLabel: changeValue(e) }))
        }
        size="sm"
      />
      <Textarea
        label="Address"
        value={address}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, address: changeValue(e) }))
        }
        rows={3}
        size="sm"
      />
      <TextInput
        label="Operating hours"
        value={operatingHours}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, operatingHours: changeValue(e) }))
        }
        size="sm"
      />
      <Group grow>
        <TextInput
          label="Email"
          value={email}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, email: changeValue(e) }))
          }
          size="sm"
        />
        <TextInput
          label="Frequency"
          description="Bisa dikosongkan"
          value={frequency}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, frequency: changeValue(e) }))
          }
          size="sm"
        />
      </Group>
      <TextInput
        label="WhatsApp number"
        description="Digits only, mis. 628811982982"
        value={whatsappNumber}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, whatsappNumber: changeValue(e) }))
        }
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
                  setDraft((prev) => ({
                    ...prev,
                    channels: prev.channels.map((c, i) =>
                      i === index ? { ...c, id: changeValue(e) } : c,
                    ),
                  }))
                }
                size="xs"
              />
              <TextInput
                label="Label"
                value={channel.label}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    channels: prev.channels.map((c, i) =>
                      i === index ? { ...c, label: changeValue(e) } : c,
                    ),
                  }))
                }
                size="xs"
              />
            </Group>
            <TextInput
              label="Detail"
              value={channel.detail}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  channels: prev.channels.map((c, i) =>
                    i === index ? { ...c, detail: changeValue(e) } : c,
                  ),
                }))
              }
              size="xs"
            />
            <Group align="flex-end">
              <TextInput
                label="Href"
                value={channel.href}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    channels: prev.channels.map((c, i) =>
                      i === index ? { ...c, href: changeValue(e) } : c,
                    ),
                  }))
                }
                size="xs"
                style={{ flex: 1 }}
              />
              <Switch
                label="External"
                checked={Boolean(channel.external)}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    channels: prev.channels.map((c, i) =>
                      i === index
                        ? { ...c, external: changeChecked(e) }
                        : c,
                    ),
                  }))
                }
              />
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    channels: prev.channels.filter((_, i) => i !== index),
                  }))
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
            setDraft((prev) => ({
              ...prev,
              channels: [
                ...prev.channels,
                {
                  id: `channel-${prev.channels.length + 1}`,
                  label: "",
                  detail: "",
                  href: "#",
                },
              ],
            }))
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
                setDraft((prev) => ({
                  ...prev,
                  hotlines: prev.hotlines.map((h, i) =>
                    i === index ? { ...h, label: changeValue(e) } : h,
                  ),
                }))
              }
              size="sm"
            />
            <TextInput
              label={index === 0 ? "Number" : undefined}
              value={line.number}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  hotlines: prev.hotlines.map((h, i) =>
                    i === index ? { ...h, number: changeValue(e) } : h,
                  ),
                }))
              }
              size="sm"
            />
            <TextInput
              label={index === 0 ? "Href" : undefined}
              value={line.href}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  hotlines: prev.hotlines.map((h, i) =>
                    i === index ? { ...h, href: changeValue(e) } : h,
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
                  hotlines: prev.hotlines.filter((_, i) => i !== index),
                }))
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
            setDraft((prev) => ({
              ...prev,
              hotlines: [
                ...prev.hotlines,
                { label: "", number: "", href: "tel:" },
              ],
            }))
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
            setDraft((prev) => ({
              ...prev,
              form: { ...prev.form, nameLabel: changeValue(e) },
            }))
          }
          size="sm"
        />
        <TextInput
          label="Name placeholder"
          value={form.namePlaceholder}
          onChange={(e) =>
            setDraft((prev) => ({
              ...prev,
              form: { ...prev.form, namePlaceholder: changeValue(e) },
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
            setDraft((prev) => ({
              ...prev,
              form: { ...prev.form, messageLabel: changeValue(e) },
            }))
          }
          size="sm"
        />
        <TextInput
          label="Message placeholder"
          value={form.messagePlaceholder}
          onChange={(e) =>
            setDraft((prev) => ({
              ...prev,
              form: { ...prev.form, messagePlaceholder: changeValue(e) },
            }))
          }
          size="sm"
        />
      </Group>
      <TextInput
        label="Submit label"
        value={form.submitLabel}
        onChange={(e) =>
          setDraft((prev) => ({
            ...prev,
            form: { ...prev.form, submitLabel: changeValue(e) },
          }))
        }
        size="sm"
      />
      <Textarea
        label="WhatsApp template"
        description="Gunakan {name} dan {message}"
        value={form.whatsappTemplate}
        onChange={(e) =>
          setDraft((prev) => ({
            ...prev,
            form: { ...prev.form, whatsappTemplate: changeValue(e) },
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
