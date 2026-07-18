import { ChromeThemeSync } from "@/components/layout/ChromeThemeSync";
import { Footer } from "@/components/layout/Footer";
import { LetterRail } from "@/components/layout/LetterRail";
import { NavMenu } from "@/components/layout/NavMenu";
import { RadioMarquee } from "@/components/layout/RadioMarquee";
import { SectionNav } from "@/components/layout/SectionNav";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { StickyMediaPlayer } from "@/components/media/StickyMediaPlayer";
import { ContactSection } from "@/components/sections/ContactSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { PartnerSection } from "@/components/sections/PartnerSection";
import { PenyiarSection } from "@/components/sections/PenyiarSection";
import { ProgramSection } from "@/components/sections/ProgramSection";
import { TentangSection } from "@/components/sections/TentangSection";
import { LETTER_NAV } from "@/data/constants";
import { footerContent } from "@/data/footer";
import { heroContent } from "@/data/hero";
import { kontakContent } from "@/data/kontak";
import { mediaPlayerContent } from "@/data/media";
import { partnerContent } from "@/data/partner";
import { penyiarContent } from "@/data/penyiar";
import { programContent, scheduleContent } from "@/data/schedule";
import { tentangContent } from "@/data/tentang";
import { getOnAirShow, getUpcomingShows, getWeekdayId } from "@/lib/schedule";

/**
 * Home — sradio-style composition: server page passes local data into sections.
 * Schedule later swaps `scheduleContent` / helpers for CMS/API.
 */
export default function HomePage() {
  const todaysShows = programContent.byDay[getWeekdayId()];
  const onAirShow = getOnAirShow(todaysShows);
  const upcomingShows = getUpcomingShows(todaysShows, 3);

  return (
    <>
      <ChromeThemeSync />
      <SiteFrame />
      <NavMenu />
      <SectionNav />
      <LetterRail links={LETTER_NAV} logoSrc={heroContent.logoSrc} />
      <StickyMediaPlayer content={mediaPlayerContent} />
      <main>
        <HeroSection
          content={heroContent}
          onAir={scheduleContent}
          onAirShow={onAirShow}
          upcomingShows={upcomingShows}
        />
        <TentangSection content={tentangContent} />
        <ProgramSection content={programContent} />
        <RadioMarquee />
        <PenyiarSection content={penyiarContent} />
        <PartnerSection content={partnerContent} />
        <ContactSection content={kontakContent} />
      </main>
      <Footer content={footerContent} />
    </>
  );
}
