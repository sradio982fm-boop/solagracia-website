import { kontakContent as fallback } from "@/data/kontak";
import type {
  KontakChannel,
  KontakContent,
  KontakFormCopy,
  KontakHotline,
} from "@/types/kontak";
import type { SectionHeaderContent, SocialLink } from "@/types/site";

function parseJsonArray<T>(raw: string | null | undefined, fallbackValue: T[]): T[] {
  if (!raw) return fallbackValue;
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) && parsed.length ? parsed : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function parseJsonObject<T>(raw: string | null | undefined, fallbackValue: T): T {
  if (!raw) return fallbackValue;
  try {
    return { ...fallbackValue, ...(JSON.parse(raw) as T) };
  } catch {
    return fallbackValue;
  }
}

export function mapKontakFromConfig(
  section: Record<string, string | null> | undefined,
  options?: {
    header?: SectionHeaderContent;
    socialLinks?: SocialLink[];
    frequencyLabel?: string;
  },
): KontakContent {
  const header = options?.header;
  const base: KontakContent = {
    ...fallback,
    ...(options?.socialLinks?.length
      ? { socialLinks: options.socialLinks }
      : {}),
    ...(options?.frequencyLabel
      ? { frequency: options.frequencyLabel }
      : {}),
    ...(header?.eyebrow ? { eyebrow: header.eyebrow } : {}),
    ...(header?.title ? { title: header.title } : {}),
    ...(header?.titleAccent ? { titleAccent: header.titleAccent } : {}),
    ...(header?.description ? { description: header.description } : {}),
  };

  if (!section || Object.keys(section).length === 0) return base;

  const channels = parseJsonArray<KontakChannel>(
    section.channels,
    fallback.channels,
  ).filter((c) => c?.id && c?.label && c?.href);

  const hotlines = parseJsonArray<KontakHotline>(
    section.hotlines,
    fallback.hotlines,
  ).filter((h) => h?.label && h?.number);

  const form = parseJsonObject<KontakFormCopy>(section.form, fallback.form);

  return {
    ...base,
    studioLabel: section.studio_label?.trim() || base.studioLabel,
    address: section.address?.trim() || base.address,
    operatingHours: section.operating_hours?.trim() || base.operatingHours,
    email: section.email?.trim() || base.email,
    frequency: section.frequency?.trim() || base.frequency,
    whatsappNumber: section.whatsapp_number?.trim() || base.whatsappNumber,
    channels: channels.length ? channels : base.channels,
    hotlines: hotlines.length ? hotlines : base.hotlines,
    form: {
      nameLabel: form.nameLabel || fallback.form.nameLabel,
      namePlaceholder: form.namePlaceholder || fallback.form.namePlaceholder,
      messageLabel: form.messageLabel || fallback.form.messageLabel,
      messagePlaceholder:
        form.messagePlaceholder || fallback.form.messagePlaceholder,
      submitLabel: form.submitLabel || fallback.form.submitLabel,
      whatsappTemplate:
        form.whatsappTemplate || fallback.form.whatsappTemplate,
    },
  };
}
