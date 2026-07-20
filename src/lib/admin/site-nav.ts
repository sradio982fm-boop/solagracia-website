export const SITE_NAV_CHILDREN = [
  {
    href: "/admin/site/seo",
    label: "SEO & Identitas",
    icon: "search",
    description: "Nama situs, title, description, OG image, favicon.",
  },
  {
    href: "/admin/site/brand",
    label: "Brand",
    icon: "verified",
    description: "Display name dan frequency label.",
  },
  {
    href: "/admin/site/hero",
    label: "Hero",
    icon: "home",
    description: "Cover, logo, tagline, dan CTA homepage.",
  },
  {
    href: "/admin/site/tentang",
    label: "Tentang",
    icon: "info",
    description: "Konten section Tentang Kami.",
  },
  {
    href: "/admin/site/kontak",
    label: "Kontak",
    icon: "call",
    description: "Alamat studio, hotline, dan form kontak.",
  },
  {
    href: "/admin/site/footer",
    label: "Footer & Marquee",
    icon: "vertical_align_bottom",
    description: "Footer columns, legal links, dan marquee.",
  },
  {
    href: "/admin/site/privacy",
    label: "Privasi",
    icon: "policy",
    description: "Kebijakan privasi situs.",
  },
  {
    href: "/admin/site/sections",
    label: "Urutan Section",
    icon: "view_agenda",
    description: "Urutan, visibility, dan label GRACIA homepage.",
  },
  {
    href: "/admin/site/headers",
    label: "Section Headers",
    icon: "title",
    description: "Eyebrow, title, dan description tiap seksi publik.",
  },
] as const;

export type SiteNavChild = (typeof SITE_NAV_CHILDREN)[number];
