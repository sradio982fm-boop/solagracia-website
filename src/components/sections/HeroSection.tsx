import Image from "next/image";
import { HeroSocialIcons } from "@/components/sections/HeroSocialIcons";
import { HeroSocialRail } from "@/components/sections/HeroSocialRail";
import { HeroTitle } from "@/components/sections/HeroTitle";
import { OnAirNow } from "@/components/sections/OnAirNow";
import { cn } from "@/lib/utils";
import type { HeroContent } from "@/types/site";
import type { OnAirContent, ScheduleShow } from "@/types/schedule";

type HeroSectionProps = {
  content: HeroContent;
  onAir: OnAirContent;
  onAirShow: ScheduleShow | null;
  upcomingShows: ScheduleShow[];
};

export function HeroSection({
  content,
  onAir,
  onAirShow,
  upcomingShows,
}: HeroSectionProps) {
  const {
    brand,
    eyebrow,
    support,
    coverSrc,
    coverAlt,
    ctas,
    socialLinks,
    verticalTagline,
  } = content;

  return (
    <section
      id="home"
      className="relative h-[100dvh] min-h-[640px] overflow-hidden bg-[var(--bg-void)] text-white"
    >
      <div className="absolute inset-0">
        <Image
          src={coverSrc}
          alt={coverAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-[rgba(8,10,16,0.32)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,16,0.34)_0%,transparent_30%,transparent_60%,rgba(8,10,16,0.62)_100%)]"
          aria-hidden
        />
      </div>

      <div
        className="pointer-events-none absolute top-1/2 left-1/2 z-[11] hidden -translate-x-1/2 -translate-y-1/2 md:block"
        style={{
          width: "max(100%, calc(100dvh * 1715 / 917))",
          height: "max(100%, calc(100dvw * 917 / 1715))",
        }}
      >
        <div
          className="pointer-events-auto absolute flex flex-col justify-center"
          style={{
            left: "14.93%",
            top: "21.81%",
            width: "21.92%",
            height: "59.32%",
            padding: "clamp(1.25rem, 2.2vw, 2rem)",
          }}
        >
          <HeroTitle brand={brand} eyebrow={eyebrow} support={support} />

          <div className="mt-7 flex items-center">
            <HeroSocialIcons links={socialLinks} joined />
            {ctas.map((cta) => (
              <a
                key={cta.label}
                href={cta.href}
                className="inline-flex h-11 items-center justify-center gap-2.5 border border-l-0 border-[var(--frame-line)] px-4 text-[13px] font-semibold transition-colors hover:bg-white/10"
              >
                <span aria-hidden className="tracking-[0.15em]">
                  {">>"}
                </span>
                <span>{cta.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <HeroSocialRail tagline={verticalTagline} />

      <div
        className="pointer-events-none absolute z-10 hidden md:block"
        style={{
          top: "var(--frame-inset)",
          bottom: "var(--frame-inset)",
          right: "var(--frame-inset)",
          width: "min(32%, 24rem)",
        }}
      >
        <div className="pointer-events-auto flex h-full min-h-0 flex-col border-l border-[var(--frame-line)] bg-black/30 px-4 py-5 backdrop-blur-[2px] animate-[hero-fade_1s_var(--ease-out)_0.1s_both] lg:px-5 lg:py-6">
          <OnAirNow
            content={onAir}
            show={onAirShow}
            upcoming={upcomingShows}
            layout="rail"
          />
        </div>
      </div>

      {/* Mobile fallback */}
      <div className="relative z-10 flex h-full flex-col justify-end px-5 pt-20 pb-6 md:hidden">
        <div className="mb-auto flex justify-end pr-12">
          <a
            href="#kontak"
            className="inline-flex h-11 items-center border border-[var(--frame-line)] px-4 text-[11px] font-semibold tracking-[0.2em] uppercase"
          >
            Reservasi
          </a>
        </div>

        <div>
          <HeroTitle brand={brand} eyebrow={eyebrow} support={support} />
          <div className="mt-5 flex items-center">
            <HeroSocialIcons links={socialLinks} joined />
            {ctas.map((cta) => (
              <a
                key={cta.label}
                href={cta.href}
                className={cn(
                  "inline-flex h-11 items-center justify-center gap-2 border border-l-0 border-[var(--frame-line)] px-4 text-sm font-semibold",
                )}
              >
                <span aria-hidden>{">>"}</span>
                <span>{cta.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-5 max-h-[42dvh] overflow-y-auto border border-[var(--frame-line)] bg-black/45 px-3 py-4 backdrop-blur-[2px]">
          <OnAirNow
            content={onAir}
            show={onAirShow}
            upcoming={upcomingShows}
            layout="stack"
          />
        </div>
      </div>
    </section>
  );
}
