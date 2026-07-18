import type { TentangContent } from "@/types/site";

/**
 * Tentang Kami — placeholder copy until CMS / editorial lands.
 */
export const tentangContent: TentangContent = {
  headline: "Studio yang hidup,",
  headlineAccent: "suara yang dekat.",
  body: "Solagracia adalah ruang dari S Radio untuk lebih jauh menumbuhkan iman kristiani.",
  stats: [
    { value: "5", label: "Program" },
    { value: "12", label: "Penyiar" },
  ],
  ctas: [
    { label: "Jelajahi Program", href: "#program", variant: "ghost" },
    { label: "Kenali Penyiar", href: "#penyiar", variant: "ghost" },
  ],
  socialLabel: "Mereka ngomong gini tentang kita",
  testimonial: {
    platform: "x",
    date: "JUN. 24, 2025",
    quote: [
      {
        type: "text",
        value:
          "Studio-nya hangat, host-nya nyambung, dan lagu-lagunya pas banget buat nunggu hujan. ",
      },
      { type: "mention", value: "@solagracia" },
      {
        type: "text",
        value: " bikin sore jadi lebih pelan. Mulai dari sini: ",
      },
      {
        type: "link",
        value: "solagracia.id",
        href: "https://solagracia.id",
      },
    ],
    authorName: "Alya Putri",
    authorHandle: "@alyaputri",
    authorInitials: "AP",
    href: "https://solagracia.id",
  },
};
