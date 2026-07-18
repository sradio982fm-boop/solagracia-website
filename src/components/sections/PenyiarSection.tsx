"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdSlot } from "@/components/ads/AdSlot";
import { SECTION_ADS } from "@/data/ads";
import {
  easeOut,
  fadeUpCard,
  staggerContainer,
  tapPress,
  viewportOnce,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { PenyiarContent, PenyiarHost } from "@/types/penyiar";

type PenyiarSectionProps = {
  content: PenyiarContent;
};

/** Hosts visible per desktop page — keeps the stage inside 100dvh */
const PAGE_SIZE = 3;

const viewport = viewportOnce;
const gridVariants = staggerContainer(0.08, 0.04);
const cardVariants = fadeUpCard;

/**
 * #penyiar — viewport-locked host roster.
 * More than 3 hosts → paged 3-up on desktop; swipe strip on mobile.
 */
export function PenyiarSection({ content }: PenyiarSectionProps) {
  const ad = SECTION_ADS.penyiar;
  const hosts = content.hosts;
  const pageCount = Math.max(1, Math.ceil(hosts.length / PAGE_SIZE));
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  const pageHosts = hosts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const canPage = hosts.length > PAGE_SIZE;

  return (
    <section
      id="penyiar"
      data-surface="white"
      className="section-surface-white section-slide relative flex flex-col border-t px-4 pt-[clamp(28px,4vw,48px)] pb-[var(--section-pad-bottom)] sm:px-6 md:pr-10 md:pl-[calc(var(--rail)+2.5rem)]"
    >
      <MicRoomAtmosphere />

      <div className="relative z-[1] mx-auto flex h-full min-h-0 w-full max-w-[1120px] flex-col gap-4 lg:gap-5">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(11.5rem,16rem)_minmax(0,1fr)] lg:gap-6 xl:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.6, ease: easeOut }}
            className="flex shrink-0 flex-col lg:min-h-0 lg:pt-1"
          >
            <p className="m-0 inline-flex w-fit items-center bg-[var(--accent)] px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] text-white uppercase">
              {content.eyebrow}
            </p>
            <h2 className="mt-3 m-0 text-[clamp(1.85rem,3.6vw,3rem)] leading-[0.98] font-extrabold tracking-[-0.03em] lg:mt-4">
              <span className="block text-[var(--section-fg)]">{content.title}</span>
              <span className="mt-0.5 block text-[var(--accent)]">
                {content.titleAccent}
              </span>
            </h2>
            <p className="mt-2.5 m-0 max-w-[18rem] text-[0.82rem] leading-relaxed text-[var(--section-muted)] lg:mt-3">
              {content.description}
            </p>

            <p className="mt-4 m-0 text-[0.68rem] font-semibold tracking-[0.16em] text-[var(--section-muted)] uppercase tabular-nums">
              {hosts.length} penyiar
              {canPage ? (
                <span className="text-[var(--section-fg)]">
                  {" "}
                  · {page + 1}/{pageCount}
                </span>
              ) : null}
            </p>

            {canPage ? (
              <div className="mt-3 hidden items-center gap-2 sm:flex">
                <PagerButton
                  label="Sebelumnya"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronIcon dir="prev" />
                </PagerButton>
                <PagerButton
                  label="Berikutnya"
                  disabled={page >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                >
                  <ChevronIcon dir="next" />
                </PagerButton>
                <div className="ml-1 flex items-center gap-1.5">
                  {Array.from({ length: pageCount }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Halaman ${index + 1}`}
                      aria-current={index === page ? "page" : undefined}
                      onClick={() => setPage(index)}
                      className={cn(
                        "h-1.5 transition-all",
                        index === page
                          ? "w-5 bg-[var(--accent)]"
                          : "w-1.5 bg-[rgba(12,12,14,0.22)] hover:bg-[rgba(12,12,14,0.4)]",
                      )}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {ad ? (
              <div className="mt-auto hidden pt-5 lg:block">
                <AdSlot ad={ad} className="max-w-none" />
              </div>
            ) : null}
          </motion.div>

          {/* Mobile: swipe all hosts · Desktop: paged 3-up */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col gap-2 sm:hidden">
              <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                {hosts.map((host) => (
                  <div
                    key={host.id}
                    className="w-[min(82vw,20rem)] shrink-0 snap-center"
                  >
                    <HostCard host={host} />
                  </div>
                ))}
              </div>
              <p className="m-0 shrink-0 text-center text-[0.62rem] tracking-[0.14em] text-[var(--section-muted)] uppercase">
                Geser untuk penyiar lain · {hosts.length}
              </p>
            </div>

            <div className="relative hidden min-h-0 flex-1 sm:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  variants={gridVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                  className="penyiar-expand-track absolute inset-0 flex gap-3.5 lg:gap-4"
                >
                  {pageHosts.map((host) => (
                    <motion.div
                      key={host.id}
                      variants={cardVariants}
                      className="host-slot min-h-0 min-w-0"
                    >
                      <HostCard host={host} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {ad ? (
          <div className="shrink-0 lg:hidden">
            <AdSlot ad={{ ...ad, variant: "inline" }} className="max-w-none" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PagerButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : tapPress}
      className="inline-flex h-9 w-9 items-center justify-center border border-[rgba(12,12,14,0.35)] text-[var(--section-fg)] transition-colors hover:bg-[rgba(12,12,14,0.05)] disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </motion.button>
  );
}

function HostCard({ host }: { host: PenyiarHost }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: easeOut }}
      className="group/card flex h-full min-h-[240px] flex-col border border-[rgba(12,12,14,0.14)] bg-[var(--section-raised)] transition-[border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:border-[rgba(12,12,14,0.32)] sm:min-h-0"
    >
      <div className="shrink-0 px-3 pt-3 pb-2 sm:px-3.5 sm:pt-3.5">
        <p className="m-0 flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.16em] text-[var(--section-muted)] uppercase">
          <MicIcon />
          Behind the mic
        </p>
        <h3 className="mt-1.5 m-0 text-[clamp(0.78rem,1.1vw,0.95rem)] leading-snug font-extrabold tracking-[-0.01em] text-[var(--section-fg)] uppercase transition-[font-size] duration-500 group-hover/card:text-[clamp(0.85rem,1.25vw,1.05rem)]">
          {host.role}
        </h3>
        <p className="mt-1 m-0 line-clamp-2 text-[11px] leading-snug text-[var(--section-muted)] transition-[max-height,opacity] duration-500 group-hover/card:line-clamp-3">
          {host.tagline}
        </p>
      </div>

      <a
        href={host.href ?? "#penyiar"}
        className="relative min-h-0 flex-1 overflow-hidden bg-[rgba(12,12,14,0.06)] no-underline"
      >
        <Image
          src={host.imageSrc}
          alt={host.imageAlt}
          fill
          sizes="(max-width: 640px) 80vw, 45vw"
          className="object-cover object-[50%_20%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.06]"
        />
        <span
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(8,10,16,0.5)_100%)] transition-opacity duration-500 group-hover/card:bg-[linear-gradient(180deg,rgba(8,10,16,0.1)_20%,rgba(8,10,16,0.62)_100%)]"
          aria-hidden
        />

        <span className="absolute top-2.5 left-2.5 text-[8px] font-bold tracking-[0.18em] text-white/80 uppercase">
          Solagracia
        </span>

        <span className="absolute bottom-2.5 left-2.5 inline-flex h-8 w-8 items-center justify-center border border-white/40 bg-black/45 text-white backdrop-blur-[2px] transition-colors duration-300 group-hover/card:border-[var(--accent)] group-hover/card:bg-[var(--accent)]">
          <PlayIcon />
        </span>

        <span className="absolute right-2.5 bottom-2.5 bg-[var(--section-fg)] px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-[var(--bg-white)] tabular-nums">
          {host.number}
        </span>

        {/* Extra tags reveal on expand */}
        {host.tags.length > 1 ? (
          <span className="absolute top-2.5 right-2.5 flex max-w-[70%] flex-wrap justify-end gap-1 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100">
            {host.tags.slice(1).map((tag) => (
              <span
                key={tag}
                className="border border-white/35 bg-black/40 px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.1em] text-white uppercase backdrop-blur-[2px]"
              >
                {tag}
              </span>
            ))}
          </span>
        ) : null}
      </a>

      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-[rgba(12,12,14,0.1)] px-3 py-2.5 transition-[padding] duration-500 group-hover/card:py-3 sm:px-3.5">
        <p className="m-0 flex min-w-0 items-center gap-2 text-[0.78rem] font-extrabold tracking-[0.04em] text-[var(--section-fg)] uppercase transition-[letter-spacing] duration-500 group-hover/card:tracking-[0.06em]">
          <span
            className="h-3 w-[2px] shrink-0 bg-[var(--accent)] transition-[height] duration-500 group-hover/card:h-4"
            aria-hidden
          />
          <span className="truncate">{host.name}</span>
        </p>
        {host.tags[0] ? (
          <span className="shrink-0 border border-[rgba(12,12,14,0.16)] px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.1em] text-[var(--section-muted)] uppercase transition-colors duration-300 group-hover/card:border-[var(--accent)] group-hover/card:text-[var(--accent)]">
            {host.tags[0]}
          </span>
        ) : null}
      </footer>
    </motion.article>
  );
}

function MicRoomAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 opacity-[0.14]">
        <Image
          src="/cover-image.png"
          alt=""
          fill
          sizes="100vw"
          className="scale-105 object-cover object-[40%_30%] blur-[2px] grayscale"
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 50% 45% at 85% 20%, rgba(196,92,38,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 8% 80%, rgba(12,12,14,0.08) 0%, transparent 50%),
            linear-gradient(165deg, rgba(200,196,186,0.92) 0%, rgba(200,196,186,0.82) 50%, rgba(200,196,186,0.9) 100%)
          `,
        }}
      />

      <div className="absolute top-1/2 left-[18%] h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(12,12,14,0.06)]" />
      <div className="absolute top-1/2 left-[18%] h-[48vmax] w-[48vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(12,12,14,0.05)]" />
      <div className="absolute top-1/2 left-[18%] h-[28vmax] w-[28vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(196,92,38,0.1)]" />

      <svg
        className="absolute top-[12%] right-[6%] h-28 w-28 opacity-[0.07]"
        viewBox="0 0 96 96"
        fill="none"
      >
        <path
          d="M20 52c0-16 12-28 28-28s28 12 28 28"
          stroke="currentColor"
          strokeWidth="3"
          className="text-[var(--section-fg)]"
        />
        <rect
          x="14"
          y="48"
          width="12"
          height="22"
          rx="2"
          fill="currentColor"
          className="text-[var(--section-fg)]"
        />
        <rect
          x="70"
          y="48"
          width="12"
          height="22"
          rx="2"
          fill="currentColor"
          className="text-[var(--section-fg)]"
        />
      </svg>

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(12,12,14,0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(12,12,14,0.9) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "170px 170px",
        }}
      />

      <p className="absolute right-[5%] bottom-[18%] text-[clamp(3rem,9vw,6.5rem)] leading-none font-extrabold tracking-[-0.06em] text-[rgba(12,12,14,0.04)] select-none">
        ON AIR
      </p>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z"
        stroke="var(--accent)"
        strokeWidth="1.6"
      />
      <path
        d="M7 11a5 5 0 0 0 10 0M12 16v4M9 20h6"
        stroke="var(--accent)"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  );
}

function ChevronIcon({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={dir === "prev" ? "M14 6L8 12l6 6" : "M10 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
    </svg>
  );
}
