import { LETTER_NAV } from "@/data/constants";
import type { FooterContent } from "@/types/site";

/**
 * Local footer copy — contact detail lives in #kontak.
 */
export const footerContent: FooterContent = {
  brandTitle: "Golden\nState of\nMind",
  brandDescription:
    "Solagracia — sub-brand S Radio. Ruang hangat untuk berkumpul, berbagi cerita, dan menemani frekuensi kota.",
  copyrightText: "© {year} Solagracia · S Radio 98.2 FM",
  listenHref: "#home",
  contactHref: "#kontak",
  contactLabel: "Hubungi Studio",
  exploreLinks: LETTER_NAV.map((link) => ({
    href: link.href,
    label: link.menuLabel,
  })),
  legalLinks: [
    { href: "#tentang", label: "Tentang" },
    { href: "#", label: "Privasi" },
  ],
  socialLinks: [
    { label: "TikTok", href: "https://www.tiktok.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "WhatsApp", href: "https://wa.me/628811982982" },
  ],
};
