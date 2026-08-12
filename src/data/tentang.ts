import type { TentangContent } from "@/types/site";

/**
 * Tentang Kami — fallback copy when CMS is unavailable.
 */
export const tentangContent: TentangContent = {
  headline: "Studio yang hidup,",
  headlineAccent: "suara yang dekat.",
  body: [
    "Solagracia adalah ruang dari S Radio untuk iman yang tumbuh pelan — lewat lagu, obrolan, dan frekuensi yang menemani hari. Bukan studio yang ramai sendiri. Kami dekat, hangat, dan tetap loft.",
    "Dari Morning Brew sampai Night Signal, setiap jam punya wajah. Dengarkan di 98.2 FM, atau mulai dari sini: kenali program dan penyiar yang menjagamu dari pagi sampai larut.",
  ],
  stats: [
    { value: "5", label: "Program" },
    { value: "12", label: "Penyiar" },
  ],
  ctas: [
    { label: "Jelajahi Program", href: "#program", variant: "ghost" },
    { label: "Kenali Penyiar", href: "#penyiar", variant: "ghost" },
  ],
  socialLabel: "Pengen lebih dekat? yuk liat postingan kami di sini!",
  reel: {
    href: "https://www.instagram.com/reel/DbfSxcjTMfU/",
  },
};
