import type { FooterLink } from "@/types/site";
import { textAllowEmpty } from "@/lib/cms-parse";

export type PrivacyContent = {
  title: string;
  updatedLabel: string;
  body: string[];
};

const FALLBACK_PRIVACY: PrivacyContent = {
  title: "Kebijakan Privasi",
  updatedLabel: "Terakhir diperbarui: Juli 2026",
  body: [
    "Solagracia menghormati privasi pengunjung dan pendengar. Halaman ini menjelaskan bagaimana kami memperlakukan informasi yang Anda berikan melalui situs ini.",
    "Kami dapat menerima data yang Anda kirim secara sukarela melalui formulir kontak atau saluran WhatsApp (nama dan isi pesan). Data tersebut dipakai hanya untuk membalas permintaan Anda.",
    "Situs ini dapat memakai cookie teknis yang diperlukan agar admin login dan pengalaman dasar berfungsi. Kami tidak menjual data pribadi kepada pihak ketiga.",
    "Untuk pertanyaan privasi, hubungi kami melalui halaman Kontak atau email yang tertera di sana.",
  ],
};

function parsePrivacyBody(
  section: Record<string, string | null>,
): string[] {
  const key =
    "privacy_body" in section
      ? "privacy_body"
      : "body" in section
        ? "body"
        : null;
  if (!key) return FALLBACK_PRIVACY.body;

  const raw = section[key];
  if (raw === null || raw === undefined || raw === "") return [];

  try {
    const parsed = JSON.parse(raw) as string[];
    if (Array.isArray(parsed)) {
      return parsed.filter((p) => typeof p === "string");
    }
  } catch {
    return raw
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  return [];
}

export function mapPrivacyFromConfig(
  section: Record<string, string | null> | undefined,
): PrivacyContent {
  if (!section || Object.keys(section).length === 0) return FALLBACK_PRIVACY;

  return {
    title: textAllowEmpty(
      section,
      "privacy_title" in section ? "privacy_title" : "title",
      FALLBACK_PRIVACY.title,
    ),
    updatedLabel: textAllowEmpty(
      section,
      "privacy_updated_label" in section
        ? "privacy_updated_label"
        : "updated_label",
      FALLBACK_PRIVACY.updatedLabel,
    ),
    body: parsePrivacyBody(section),
  };
}

export const PRIVACY_FOOTER_LINK_KEY = "privacy_show_footer_link";
export const PRIVACY_FOOTER_LINK_DEFAULT = true;

function isPrivacyFooterLink(link: FooterLink): boolean {
  const label = link.label.toLowerCase();
  return (
    link.href === "/privasi" ||
    label.includes("privasi") ||
    label.includes("privacy")
  );
}

export function ensurePrivacyLegalLink(links: FooterLink[]): FooterLink[] {
  const hasPrivacy = links.some(isPrivacyFooterLink);
  if (hasPrivacy) {
    return links.map((link) =>
      isPrivacyFooterLink(link)
        ? { ...link, href: link.href === "#" ? "/privasi" : link.href }
        : link,
    );
  }
  return [...links, { href: "/privasi", label: "Privasi" }];
}

export function applyPrivacyFooterLink(
  links: FooterLink[],
  showPrivacyLink: boolean,
): FooterLink[] {
  if (!showPrivacyLink) {
    return links.filter((link) => !isPrivacyFooterLink(link));
  }
  return ensurePrivacyLegalLink(links);
}

export { FALLBACK_PRIVACY };
