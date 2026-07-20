import { AdSlot } from "@/components/ads/AdSlot";
import { SECTION_SURFACE, type SectionId } from "@/data/constants";
import type { AdPlaceholder } from "@/types/ads";
import { cn } from "@/lib/utils";

type SectionShellProps = {
  id: SectionId;
  eyebrow: string;
  title: string;
  description: string;
  /** Hide the curated partner slot for this section */
  hideAd?: boolean;
  ad?: AdPlaceholder;
};

/**
 * Shared section stub shell — alternating surfaces + optional quiet ad plate.
 */
export function SectionShell({
  id,
  eyebrow,
  title,
  description,
  hideAd = false,
  ad: adProp,
}: SectionShellProps) {
  const surface = SECTION_SURFACE[id];
  const ad = hideAd ? undefined : adProp;

  return (
    <section
      id={id}
      data-surface={surface}
      className={cn(
        "relative min-h-[100dvh] border-t px-6 py-24 md:pr-10 md:pl-[calc(var(--rail)+2.5rem)]",
        surface === "white" && "section-surface-white",
        surface === "smoke" && "section-surface-smoke",
        surface === "dark" && "section-surface-dark",
      )}
    >
      <div className="relative z-0 max-w-3xl">
        <p className="text-[11px] tracking-[0.28em] text-[var(--section-muted)] uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--section-fg)] md:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-lg text-[var(--section-muted)]">{description}</p>
      </div>

      {ad ? (
        <AdSlot
          ad={ad}
          className={cn(
            "mt-16 max-w-3xl md:mt-20",
            ad.variant === "panel" && "md:ml-auto md:mr-[clamp(0px,4vw,3rem)]",
          )}
        />
      ) : null}
    </section>
  );
}
