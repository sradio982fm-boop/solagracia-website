import type { TentangContent } from "@/types/site";

/**
 * Tentang Kami — placeholder copy until CMS / editorial lands.
 */
export const tentangContent: TentangContent = {
  headline: "Studio yang hidup,",
  headlineAccent: "suara yang dekat.",
  body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
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
          "Lorem ipsum dolor sit amet — studio-nya hangat, host-nya nyambung, dan lagu-lagunya pas banget buat nunggu hujan. ",
      },
      { type: "mention", value: "@solagracia" },
      {
        type: "text",
        value: " bikin sore jadi lebih pelan. Mulai dari sini: ",
      },
      {
        type: "link",
        value: "solagracia.id",
        href: "#",
      },
    ],
    authorName: "Alya Putri",
    authorHandle: "@alyaputri",
    authorInitials: "AP",
    href: "#",
  },
};
