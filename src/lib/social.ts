import type { SocialIconId, SocialLink } from "@/types/site";
import { heroContent } from "@/data/hero";

const PLATFORM_ICONS: Record<string, SocialIconId> = {
  tiktok: "tiktok",
  instagram: "instagram",
  whatsapp: "whatsapp",
  youtube: "youtube",
  x: "x",
  twitter: "x",
  facebook: "facebook",
  spotify: "spotify",
};

export function platformToIcon(platform: string): SocialIconId {
  return PLATFORM_ICONS[platform.toLowerCase()] ?? "link";
}

export type SocialRow = {
  platform: string;
  label: string;
  url: string;
};

/** Maps DB/active social rows → public SocialLink[]. Falls back to hero static. */
export function toSocialLinks(rows: SocialRow[] | null | undefined): SocialLink[] {
  if (!rows?.length) return [...heroContent.socialLinks];
  return rows.map((row) => ({
    label: row.label,
    href: row.url,
    icon: platformToIcon(row.platform),
  }));
}

export function toFooterSocialLinks(
  rows: SocialRow[] | null | undefined,
): { label: string; href: string }[] {
  return toSocialLinks(rows).map(({ label, href }) => ({ label, href }));
}
