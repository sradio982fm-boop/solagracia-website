import { Footer } from "@/components/layout/Footer";
import { SiteNavigation } from "@/components/layout/SiteNavigation";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { RadioMarquee } from "@/components/layout/RadioMarquee";
import { StickyMediaPlayer } from "@/components/media/StickyMediaPlayer";
import { FrequencyTuningLazy } from "@/components/motion/FrequencyTuningLazy";
import { ContactSection } from "@/components/sections/ContactSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { PartnerSection } from "@/components/sections/PartnerSection";
import { PenyiarSection } from "@/components/sections/PenyiarSection";
import { ProgramSection } from "@/components/sections/ProgramSection";
import { TentangSection } from "@/components/sections/TentangSection";
import type { SectionId } from "@/data/constants";
import {
  applyHeader,
  fetchBrandContent,
  fetchFooterContent,
  fetchHeroContent,
  fetchKontakContent,
  fetchMarqueeItems,
  fetchMediaPlayerContent,
  fetchOnAirContent,
  fetchPartnerContent,
  fetchPenyiarContent,
  fetchProgramContent,
  fetchSectionConfig,
  fetchSectionHeaders,
  fetchSectionAds,
  fetchSocialLinks,
  fetchTentangContent,
} from "@/lib/data-fetcher";
import { buildExploreLinks, orderedVisibleSectionKeys } from "@/lib/section-config";
import { getOnAirShow, getUpcomingShows, getWeekdayId } from "@/lib/schedule";
import { toFooterSocialLinks, toSocialLinks } from "@/lib/social";
import type { ReactNode } from "react";

export const revalidate = 3600;

/**
 * Home — SSR content from Supabase with static fallbacks.
 */
export default async function HomePage() {
  const now = jakartaNow();
  const todayId = getWeekdayId(now);

  const [socialRows, headers, brand, program, onAir, penyiar, sectionAds, sectionConfig] =
    await Promise.all([
      fetchSocialLinks(),
      fetchSectionHeaders(),
      fetchBrandContent(),
      fetchProgramContent(),
      fetchOnAirContent(todayId),
      fetchPenyiarContent(),
      fetchSectionAds(),
      fetchSectionConfig(),
    ]);

  const partner = await fetchPartnerContent(headers.partner);

  const todaysShows = program.byDay[todayId];
  const onAirShow = getOnAirShow(todaysShows, now);
  const upcomingShows = getUpcomingShows(todaysShows, 3, now);

  const socialLinks = toSocialLinks(socialRows);
  const footerSocials = toFooterSocialLinks(socialRows);
  const exploreLinks = buildExploreLinks(sectionConfig.nav);

  const [mediaPlayerContent, hero, tentang, kontak, footer, marqueeItems] =
    await Promise.all([
      fetchMediaPlayerContent(onAirShow?.title),
      fetchHeroContent(socialLinks),
      fetchTentangContent(brand.frequencyLabel),
      fetchKontakContent({
        socialLinks,
        frequencyLabel: brand.frequencyLabel,
        header: headers.kontak,
      }),
      fetchFooterContent({ socialLinks: footerSocials, exploreLinks }),
      fetchMarqueeItems(),
    ]);

  const programWithMeta = {
    ...applyHeader(program, headers.program),
    frequencyLabel: brand.frequencyLabel,
  };

  const visibleSections = orderedVisibleSectionKeys(sectionConfig.sections);
  const sectionBlocks = visibleSections.flatMap((sectionId) =>
    renderSection(sectionId, {
      hero,
      onAir,
      onAirShow,
      upcomingShows,
      tentang,
      programWithMeta,
      todayId,
      marqueeItems,
      penyiar,
      headers,
      partner,
      kontak,
      sectionAds,
    }),
  );

  return (
    <>
      <SiteFrame />
      <SiteNavigation
        nav={sectionConfig.nav}
        sectionIds={sectionConfig.sectionIds}
        surfaces={sectionConfig.surfaces}
        logoSrc={hero.logoSrc}
      />
      <StickyMediaPlayer content={mediaPlayerContent} />
      <FrequencyTuningLazy />
      <main className="w-full max-w-full overflow-x-hidden">{sectionBlocks}</main>
      <Footer content={footer} />
    </>
  );
}

type SectionRenderContext = {
  hero: Awaited<ReturnType<typeof fetchHeroContent>>;
  onAir: Awaited<ReturnType<typeof fetchOnAirContent>>;
  onAirShow: ReturnType<typeof getOnAirShow>;
  upcomingShows: ReturnType<typeof getUpcomingShows>;
  tentang: Awaited<ReturnType<typeof fetchTentangContent>>;
  programWithMeta: Awaited<ReturnType<typeof fetchProgramContent>> & {
    frequencyLabel: string;
  };
  todayId: ReturnType<typeof getWeekdayId>;
  marqueeItems: string[];
  penyiar: Awaited<ReturnType<typeof fetchPenyiarContent>>;
  headers: Awaited<ReturnType<typeof fetchSectionHeaders>>;
  partner: Awaited<ReturnType<typeof fetchPartnerContent>>;
  kontak: Awaited<ReturnType<typeof fetchKontakContent>>;
  sectionAds: Awaited<ReturnType<typeof fetchSectionAds>>;
};

function renderSection(
  sectionId: SectionId,
  ctx: SectionRenderContext,
): ReactNode[] {
  switch (sectionId) {
    case "home":
      return [
        <HeroSection
          key="home"
          content={ctx.hero}
          onAir={ctx.onAir}
          onAirShow={ctx.onAirShow}
          upcomingShows={ctx.upcomingShows}
        />,
      ];
    case "tentang":
      return [
        <TentangSection
          key="tentang"
          content={ctx.tentang}
          ad={ctx.sectionAds.tentang}
        />,
      ];
    case "program":
      return [
        <ProgramSection
          key="program"
          content={ctx.programWithMeta}
          initialDay={ctx.todayId}
          ad={ctx.sectionAds.program}
        />,
        <RadioMarquee key="marquee" items={ctx.marqueeItems} />,
      ];
    case "penyiar":
      return [
        <PenyiarSection
          key="penyiar"
          content={applyHeader(ctx.penyiar, ctx.headers.penyiar)}
          ad={ctx.sectionAds.penyiar}
        />,
      ];
    case "partner":
      return [<PartnerSection key="partner" content={ctx.partner} />];
    case "kontak":
      return [<ContactSection key="kontak" content={ctx.kontak} />];
    default:
      return [];
  }
}

/** Stable “now” in WIB for SSR + client schedule selection */
function jakartaNow(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
}
