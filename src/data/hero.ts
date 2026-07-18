import type { HeroContent } from "@/types/site";

/**
 * Local hero copy — stand-in for future CMS / site_config.
 * Swap fields later; keep HeroSection prop-driven.
 */
export const heroContent: HeroContent = {
  brand: "Solagracia.",
  eyebrow: "S Radio sub-brand",
  support: "Ruang hangat untuk berkumpul dan berbagi cerita.",
  verticalTagline: "Golden state of mind",
  coverSrc: "/cover-image.png",
  coverAlt:
    "Penyiar dengan headphone dan mikrofon di studio — latar biru dan emas Solagracia",
  logoSrc: "/logo.png",
  ctas: [
    { label: "Tentang", href: "#tentang", variant: "text", icon: "arrow" },
  ],
  panelRows: [
    {
      initials: "EV",
      title: "Events",
      blurb: "Gathering intim dengan atmosfer loft.",
      href: "#program",
    },
    {
      initials: "SP",
      title: "Spaces",
      blurb: "Ruang untuk makan, kerja, dan cerita.",
      href: "#tentang",
    },
    {
      initials: "ST",
      title: "Stories",
      blurb: "Cerita di balik meja dan dinding bata.",
      href: "#penyiar",
    },
  ],
  socialLinks: [
    {
      label: "TikTok",
      href: "https://www.tiktok.com",
      icon: "tiktok",
    },
    {
      label: "Instagram",
      href: "https://instagram.com",
      icon: "instagram",
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/628811982982",
      icon: "whatsapp",
    },
  ],
};
