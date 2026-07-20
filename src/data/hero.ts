import type { HeroContent } from "@/types/site";

/**
 * Local hero copy — fallback when CMS site_config.hero is empty.
 */
export const heroContent: HeroContent = {
  brand: "Solagracia.",
  eyebrow: "S Radio sub-brand",
  support: "Ruang dari S Radio untuk lebih jauh menumbuhkan iman kristiani.",
  verticalTagline: "Golden state of mind",
  coverSrc: "/cover-image.png",
  coverAlt:
    "Penyiar dengan headphone dan mikrofon di studio — latar biru dan emas Solagracia",
  logoSrc: "/logo.png",
  ctas: [
    { label: "Tentang", href: "#tentang", variant: "text", icon: "arrow" },
  ],
  mobileCtaLabel: "Reservasi",
  mobileCtaHref: "#partner",
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
