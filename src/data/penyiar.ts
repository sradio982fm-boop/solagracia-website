import type { PenyiarContent } from "@/types/penyiar";

/**
 * On-air roster — UI pages 3 hosts at a time (viewport-locked).
 * Add as many as needed; CMS can replace this list later.
 */
export const penyiarContent: PenyiarContent = {
  eyebrow: "Meet Us",
  title: "Penyiar",
  titleAccent: "Solagracia",
  description:
    "Suara di balik mic — host yang menemani frekuensi loft dari pagi sampai larut.",
  hosts: [
    {
      id: "raka",
      name: "Raka Wijaya",
      role: "Music Director",
      tagline: "Kurasi yang hangat untuk pagi kota.",
      tags: ["Morning Brew"],
      imageSrc: "/cover-image.png",
      imageAlt: "Raka Wijaya — penyiar Solagracia",
      number: "#01",
      href: "#program",
    },
    {
      id: "alya",
      name: "Alya Putri",
      role: "Story Host",
      tagline: "Cerita singkat yang nyambung.",
      tags: ["Midday", "Weekend"],
      imageSrc: "/cover-image.png",
      imageAlt: "Alya Putri — penyiar Solagracia",
      number: "#02",
      href: "#program",
    },
    {
      id: "salsa",
      name: "Salsa Nabila",
      role: "Drive Time",
      tagline: "Teman pulang dengan mood loft.",
      tags: ["Loft Drive"],
      imageSrc: "/cover-image.png",
      imageAlt: "Salsa Nabila — penyiar Solagracia",
      number: "#03",
      href: "#program",
    },
    {
      id: "dimas",
      name: "Dimas Hartono",
      role: "Golden Hour",
      tagline: "Seleksi sore yang pelan dan hangat.",
      tags: ["Music Mix"],
      imageSrc: "/cover-image.png",
      imageAlt: "Dimas Hartono — penyiar Solagracia",
      number: "#04",
      href: "#program",
    },
    {
      id: "beni",
      name: "Beni Prakoso",
      role: "Night Signal",
      tagline: "Frekuensi malam untuk yang masih terjaga.",
      tags: ["Night Show"],
      imageSrc: "/cover-image.png",
      imageAlt: "Beni Prakoso — penyiar Solagracia",
      number: "#05",
      href: "#program",
    },
    {
      id: "nara",
      name: "Nara Putri",
      role: "Weekend Rise",
      tagline: "Pagi akhir pekan yang lebih santai.",
      tags: ["Weekend"],
      imageSrc: "/cover-image.png",
      imageAlt: "Nara Putri — penyiar Solagracia",
      number: "#06",
      href: "#program",
    },
  ],
};
