import type { FooterLink } from "@/types/site";

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

export function mapPrivacyFromConfig(
  section: Record<string, string | null> | undefined,
): PrivacyContent {
  if (!section || Object.keys(section).length === 0) return FALLBACK_PRIVACY;

  const bodyRaw = section.privacy_body || section.body;
  let body = FALLBACK_PRIVACY.body;
  if (bodyRaw) {
    try {
      const parsed = JSON.parse(bodyRaw) as string[];
      if (Array.isArray(parsed) && parsed.length) {
        body = parsed.filter((p) => typeof p === "string" && p.trim());
      }
    } catch {
      const paragraphs = bodyRaw
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (paragraphs.length) body = paragraphs;
    }
  }

  return {
    title:
      section.privacy_title?.trim() ||
      section.title?.trim() ||
      FALLBACK_PRIVACY.title,
    updatedLabel:
      section.privacy_updated_label?.trim() ||
      section.updated_label?.trim() ||
      FALLBACK_PRIVACY.updatedLabel,
    body,
  };
}

export function ensurePrivacyLegalLink(links: FooterLink[]): FooterLink[] {
  const hasPrivacy = links.some(
    (l) =>
      l.href === "/privasi" ||
      l.label.toLowerCase().includes("privasi") ||
      l.label.toLowerCase().includes("privacy"),
  );
  if (hasPrivacy) {
    return links.map((l) =>
      l.label.toLowerCase().includes("privasi") ||
      l.label.toLowerCase().includes("privacy")
        ? { ...l, href: l.href === "#" ? "/privasi" : l.href }
        : l,
    );
  }
  return [...links, { href: "/privasi", label: "Privasi" }];
}

export { FALLBACK_PRIVACY };
