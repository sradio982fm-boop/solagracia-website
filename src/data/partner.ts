import type { PartnerContent } from "@/types/partner";

/**
 * Partner Kami — logo history + sponsorship tiers.
 * WhatsApp number / plans swap via CMS later.
 */
export const partnerContent: PartnerContent = {
  eyebrow: "Partnership",
  title: "Partner Kami",
  description:
    "Brand yang tumbuh bersama frekuensi loft — dan paket siaran untuk cerita Anda berikutnya.",
  historyLabel: "Yang pernah bersama kami",
  plansLabel: "Sponsorship Plans",
  moreInfoLabel: "More Info",
  moreInfoHref: "#kontak",
  whatsappNumber: "628811982982",
  planCtaLabel: "WhatsApp",
  currencyPrefix: "IDR",
  partners: [
    { id: "sradio", name: "S Radio 98.2 FM", initials: "SR" },
    { id: "golden", name: "Golden Hour Cafe", initials: "GH" },
    { id: "loft", name: "Studio Loft Space", initials: "SL" },
    { id: "ember", name: "Ember Audio Co.", initials: "EA" },
    { id: "malang", name: "Malang Collective", initials: "MC" },
    { id: "wave", name: "Wave Records", initials: "WR" },
    { id: "north", name: "North Beam", initials: "NB" },
    { id: "kota", name: "Kota Stories", initials: "KS" },
  ],
  plans: [
    {
      id: "loose-spot",
      name: "Loose Spot",
      price: "150K",
      unit: "/spot",
      features: [
        "Durasi 60 detik",
        "Format MP3 / WAV / AAC",
        "Materi dari klien",
        "Pembayaran di muka",
      ],
      whatsappMessage:
        "Halo Solagracia, saya tertarik paket Loose Spot (IDR 150K/spot).",
    },
    {
      id: "insert",
      name: "Insert",
      price: "250K",
      unit: "/spot",
      featured: true,
      features: [
        "Durasi 2 menit",
        "Format MP3 / WAV / AAC",
        "Materi dari klien",
        "Pembayaran di muka",
      ],
      whatsappMessage:
        "Halo Solagracia, saya tertarik paket Insert (IDR 250K/spot).",
    },
    {
      id: "semi-blocking",
      name: "Semi Blocking",
      price: "2M",
      unit: "/jam",
      features: [
        "Durasi 60 menit",
        "Live / video conference",
        "Materi dari klien",
        "Pembayaran di muka",
      ],
      whatsappMessage:
        "Halo Solagracia, saya tertarik paket Semi Blocking (IDR 2M/jam).",
    },
  ],
};

export function whatsappHref(number: string, message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}
