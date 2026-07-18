import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Register GSAP plugins once (client-only). */
export function ensureGsap(): typeof gsap {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return gsap;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const STATIONS = [
  { id: "home", label: "HOME", hz: "98.2" },
  { id: "tentang", label: "TENTANG", hz: "98.3" },
  { id: "program", label: "PROGRAM", hz: "98.4" },
  { id: "penyiar", label: "PENYIAR", hz: "98.5" },
  { id: "partner", label: "PARTNER", hz: "98.6" },
  { id: "kontak", label: "KONTAK", hz: "98.7" },
] as const;

export type StationId = (typeof STATIONS)[number]["id"];

export { gsap, ScrollTrigger };
