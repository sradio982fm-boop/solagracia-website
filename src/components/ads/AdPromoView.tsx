"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LiquidAurora } from "@/components/ads/LiquidAurora";
import {
  AD_SECTION_LABELS,
  type AdCapableSectionId,
} from "@/lib/ads";
import type { AdPromoSource } from "@/lib/ad-promo";
import { formatAdPromoRef } from "@/lib/ad-promo";
import {
  easeOut,
  fadeUpSoft,
  hoverLift,
  staggerContainer,
  tapPress,
} from "@/lib/motion";
import { sanitizeHttpHref } from "@/lib/security";
import { cn } from "@/lib/utils";

const BENEFITS = [
  {
    title: "Frekuensi loft",
    body: "98.2 FM — suara yang dekat, audiens yang setia dari pagi sampai larut.",
  },
  {
    title: "Paket fleksibel",
    body: "Loose Spot, Insert, sampai Semi Blocking. Pilih durasi yang pas untuk cerita brand Anda.",
  },
  {
    title: "Respon cepat",
    body: "Chat langsung ke studio via WhatsApp. Tim kami siap bantu cek slot dan materi.",
  },
] as const;

type AdPromoViewProps = {
  source: AdPromoSource;
  whatsappHref: string;
  frequencyLabel: string;
};

export function AdPromoView({
  source,
  whatsappHref,
  frequencyLabel,
}: AdPromoViewProps) {
  const sectionLabel =
    source.from && source.from in AD_SECTION_LABELS
      ? AD_SECTION_LABELS[source.from as AdCapableSectionId]
      : null;
  const creative = source.sponsor?.trim() || source.label?.trim() || null;
  const safeWhatsApp = sanitizeHttpHref(whatsappHref, "");

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[var(--bg-void)] text-[var(--text-main)]">
      <LiquidAurora />

      <div className="relative z-[1] mx-auto flex min-h-[100dvh] w-full max-w-[42rem] flex-col px-4 py-10 sm:px-6 sm:py-14">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
          className="m-0 inline-flex w-fit border border-[var(--frame-line)] bg-black/25 px-2.5 py-1 text-[10px] font-semibold tracking-[0.22em] text-[var(--text-dim)] uppercase backdrop-blur-[2px]"
        >
          Open promotion · {frequencyLabel}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: easeOut }}
          className="mt-5 m-0 text-[clamp(2.1rem,7vw,3.4rem)] leading-[0.98] font-extrabold tracking-[-0.035em] drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]"
        >
          Space iklan ini
          <span className="block text-[var(--accent)]">bisa jadi milikmu.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: easeOut }}
          className="mt-4 m-0 max-w-[34rem] text-[0.95rem] leading-relaxed text-[var(--text-dim)] sm:text-[1.05rem]"
        >
          Solagracia membuka frekuensi loft untuk brand yang ingin didengar —
          hangat, dekat, dan tetap on-brand. Chat studio sekarang untuk cek
          ketersediaan.
        </motion.p>

        {(sectionLabel || creative || source.line || source.id) && (
          <motion.dl
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: easeOut }}
            className="mt-6 grid gap-2 border border-[var(--frame-line)] bg-black/45 px-4 py-3 text-[0.8rem] backdrop-blur-[3px]"
          >
            {sectionLabel ? (
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <dt className="m-0 tracking-[0.12em] text-[var(--text-dim)] uppercase">
                  Slot
                </dt>
                <dd className="m-0 font-semibold text-[var(--text-main)]">
                  {sectionLabel}
                </dd>
              </div>
            ) : null}
            {creative ? (
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <dt className="m-0 tracking-[0.12em] text-[var(--text-dim)] uppercase">
                  Creative
                </dt>
                <dd className="m-0 font-semibold text-[var(--text-main)]">
                  {creative}
                </dd>
              </div>
            ) : null}
            {source.line?.trim() ? (
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <dt className="m-0 tracking-[0.12em] text-[var(--text-dim)] uppercase">
                  Line
                </dt>
                <dd className="m-0 text-[var(--text-main)]">
                  {source.line.trim()}
                </dd>
              </div>
            ) : null}
            {source.id ? (
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <dt className="m-0 tracking-[0.12em] text-[var(--text-dim)] uppercase">
                  Ref
                </dt>
                <dd className="m-0 font-mono text-[0.75rem] text-[var(--text-dim)]">
                  {formatAdPromoRef(source.id)}
                </dd>
              </div>
            ) : null}
          </motion.dl>
        )}

        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          variants={staggerContainer(0.08, 0.2)}
          initial="hidden"
          animate="show"
        >
          {safeWhatsApp ? (
            <motion.a
              href={safeWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeUpSoft}
              whileHover={hoverLift}
              whileTap={tapPress}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-5 text-[12px] font-bold tracking-[0.16em] text-white uppercase transition-colors duration-200",
                "hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                "shadow-[0_0_32px_rgba(196,92,38,0.35)]",
              )}
            >
              <WhatsAppIcon />
              Chat WhatsApp
            </motion.a>
          ) : null}

          <motion.div variants={fadeUpSoft}>
            <Link
              href="/#partner"
              className="inline-flex min-h-11 cursor-pointer items-center justify-center border border-[var(--frame-line)] bg-black/30 px-5 text-[12px] font-semibold tracking-[0.16em] text-[var(--text-main)] uppercase no-underline backdrop-blur-[2px] transition-colors duration-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
            >
              Lihat paket
            </Link>
          </motion.div>
        </motion.div>

        <motion.ul
          className="mt-12 m-0 grid list-none gap-3 p-0 sm:grid-cols-3"
          variants={staggerContainer(0.07, 0.28)}
          initial="hidden"
          animate="show"
        >
          {BENEFITS.map((item) => (
            <motion.li
              key={item.title}
              variants={fadeUpSoft}
              className="border border-[var(--frame-line)] bg-black/40 px-3.5 py-4 backdrop-blur-[3px]"
            >
              <p className="m-0 text-[11px] font-bold tracking-[0.14em] text-[var(--text-main)] uppercase">
                {item.title}
              </p>
              <p className="mt-2 m-0 text-[0.8rem] leading-relaxed text-[var(--text-dim)]">
                {item.body}
              </p>
            </motion.li>
          ))}
        </motion.ul>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45, ease: easeOut }}
          className="mt-auto pt-12 m-0"
        >
          <Link
            href="/"
            className="text-[0.75rem] font-semibold tracking-[0.14em] text-[var(--text-dim)] uppercase no-underline underline-offset-4 transition-colors hover:text-[var(--text-main)] hover:underline"
          >
            ← Kembali ke beranda
          </Link>
        </motion.p>
      </div>
    </main>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
