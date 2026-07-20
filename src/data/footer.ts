import { LETTER_NAV } from "@/data/constants";
import type { FooterContent } from "@/types/site";

/**
 * Local footer copy — contact detail lives in #kontak.
 */
export const footerContent: FooterContent = {
  brandTitle: "Golden\nState of\nMind",
  brandDescription:
    "Solagracia — sub-brand S Radio. Ruang untuk lebih jauh menumbuhkan iman kristiani.",
  copyrightText: "© {year} Solagracia · S Radio 98.2 FM",
  listenHref: "#home",
  listenLabel: "Dengarkan",
  contactHref: "#kontak",
  contactLabel: "Hubungi Studio",
  columnIkuti: "Ikuti",
  columnJelajahi: "Jelajahi",
  wordmark: "SOLAGRACIA",
  wordmarkSub: "·S RADIO",
  exploreLinks: LETTER_NAV.map((link) => ({
    href: link.href,
    label: link.menuLabel,
  })),
  legalLinks: [
    { href: "#tentang", label: "Tentang" },
    { href: "/privasi", label: "Privasi" },
  ],
  socialLinks: [
    { label: "TikTok", href: "https://www.tiktok.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "WhatsApp", href: "https://wa.me/628811982982" },
  ],
};
