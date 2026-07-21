import type { Metadata } from "next";
import { AdPromoView } from "@/components/ads/AdPromoView";
import { buildAdWhatsAppHref } from "@/lib/ad-promo";
import {
  fetchBrandContent,
  fetchKontakContent,
  fetchSeoContent,
  resolveAdPromoSource,
} from "@/lib/data-fetcher";

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoContent();
  return {
    title: "Pasang Iklan",
    description:
      "Space iklan Solagracia — frekuensi loft 98.2 FM. Chat WhatsApp untuk cek paket dan ketersediaan slot.",
    openGraph: {
      title: `Pasang Iklan · ${seo.siteName}`,
      description:
        "Buka frekuensi loft untuk brand Anda. Hubungi studio via WhatsApp.",
    },
  };
}

export default async function IklanPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const source = await resolveAdPromoSource(params);

  const [brand, kontak] = await Promise.all([
    fetchBrandContent(),
    fetchKontakContent(),
  ]);

  const whatsappHref = buildAdWhatsAppHref(kontak.whatsappNumber, source);

  return (
    <AdPromoView
      source={source}
      whatsappHref={whatsappHref}
      frequencyLabel={brand.frequencyLabel}
    />
  );
}
