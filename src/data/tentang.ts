import type { TentangContent } from "@/types/site";

/**
 * Tentang Kami — fallback copy when CMS is unavailable.
 */
export const tentangContent: TentangContent = {
  headline: "Studio yang hidup,",
  headlineAccent: "suara yang dekat.",
  body: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.",
  ],
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
