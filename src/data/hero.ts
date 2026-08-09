import type { HeroContent } from "@/types/site";

/**
 * Local hero copy — fallback when CMS site_config.hero is empty.
 */
export const heroContent: HeroContent = {
  brand: "Solagracia\nDigital Radio",
  eyebrow: "S Radio sub-brand",
  support: "",
  verticalTagline: "Golden state of mind",
  coverSrc: "/cover-image.png",
  coverAlt:
    "Penyiar dengan headphone dan mikrofon di studio — latar biru dan emas Solagracia",
  logoSrc: "/logo.png",
  ctas: [
    { label: "Tentang", href: "#tentang", variant: "text", icon: "arrow" },
  ],
  mobileCtaLabel: "",
  mobileCtaHref: "",
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
