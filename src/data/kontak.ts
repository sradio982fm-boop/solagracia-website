import type { KontakContent } from "@/types/kontak";

/**
 * Kontak Kami — studio desk channels + WhatsApp message form.
 * Numbers / handles swap via CMS later.
 */
export const kontakContent: KontakContent = {
  eyebrow: "Kontak",
  title: "Hubungi",
  titleAccent: "Studio",
  description:
    "Reservasi, kerjasama, atau sekadar sapa ke frekuensi loft — kami siap di saluran yang paling dekat dengan Anda.",
  studioLabel: "Studio Malang",
  address: "Jl. Jaksa Agung Suprapto No. 19\nKlojen, Kota Malang\nJawa Timur 65111",
  operatingHours: "On air tiap hari · 06.00 – 24.00 WIB",
  email: "halo@solagracia.id",
  frequency: "98.2 FM",
  whatsappNumber: "628811982982",
  channels: [
    {
      id: "whatsapp",
      label: "WhatsApp",
      detail: "Balasan tercepat",
      href: "https://wa.me/628811982982",
      external: true,
    },
    {
      id: "email",
      label: "Email",
      detail: "halo@solagracia.id",
      href: "mailto:halo@solagracia.id",
    },
    {
      id: "hotline",
      label: "Hotline",
      detail: "0881-1982-982",
      href: "tel:+628811982982",
    },
  ],
  hotlines: [
    {
      label: "Hotline Studio",
      number: "0881-1982-982",
      href: "tel:+628811982982",
    },
    {
      label: "Halo Light Up",
      number: "0881-0274-69225",
      href: "tel:+62881027469225",
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
  form: {
    nameLabel: "Nama",
    namePlaceholder: "Nama Anda",
    messageLabel: "Pesan",
    messagePlaceholder: "Ceritakan singkat kebutuhan Anda…",
    submitLabel: "Kirim via WhatsApp",
    whatsappTemplate:
      "Halo Solagracia, saya {name}.\n\n{message}",
  },
};

export function buildKontakWhatsAppHref(
  number: string,
  template: string,
  name: string,
  message: string,
): string {
  const text = encodeURIComponent(
    template
      .replace("{name}", name.trim() || "teman Solagracia")
      .replace("{message}", message.trim() || "Saya ingin menghubungi studio."),
  );
  return `https://wa.me/${number}?text=${text}`;
}
