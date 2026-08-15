import { kontakContent as fallback } from "@/data/kontak";
import {
  headerField,
  parseJsonArrayAllowEmpty,
  parseJsonObjectAllowEmpty,
  textAllowEmpty,
} from "@/lib/cms-parse";
import type {
  KontakChannel,
  KontakContent,
  KontakFormCopy,
  KontakHotline,
} from "@/types/kontak";
import type { SectionHeaderContent, SocialLink } from "@/types/site";

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
    eyebrow: headerField(header, "eyebrow", fallback.eyebrow),
    title: headerField(header, "title", fallback.title),
    titleAccent: headerField(header, "titleAccent", fallback.titleAccent),
    description: headerField(header, "description", fallback.description),
    ...(options?.socialLinks?.length
      ? { socialLinks: options.socialLinks }
      : {}),
    ...(options?.frequencyLabel
      ? { frequency: options.frequencyLabel }
      : {}),
  };

  if (!section || Object.keys(section).length === 0) return base;

  const channels = parseJsonArrayAllowEmpty<KontakChannel>(
    section,
    "channels",
    fallback.channels,
  ).filter((c) => c?.id && c?.label && c?.href);

  const hotlines = parseJsonArrayAllowEmpty<KontakHotline>(
    section,
    "hotlines",
    fallback.hotlines,
  ).filter((h) => h?.label && h?.number);

  const form = parseJsonObjectAllowEmpty<KontakFormCopy>(
    section,
    "form",
    fallback.form,
  );

  return {
    ...base,
    studioLabel: textAllowEmpty(section, "studio_label", base.studioLabel),
    address: textAllowEmpty(section, "address", base.address),
    operatingHours: textAllowEmpty(
      section,
      "operating_hours",
      base.operatingHours,
    ),
    email: textAllowEmpty(section, "email", base.email),
    frequency: textAllowEmpty(section, "frequency", base.frequency),
    whatsappNumber: textAllowEmpty(
      section,
      "whatsapp_number",
      base.whatsappNumber,
    ),
    channels,
    hotlines,
    form,
  };
}
