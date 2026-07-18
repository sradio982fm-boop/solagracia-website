"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { SocialIcon } from "@/components/sections/HeroSocialIcons";
import { buildKontakWhatsAppHref } from "@/data/kontak";
import {
  easeOut,
  fadeUpSoft,
  hoverLift,
  staggerContainer,
  tapPress,
  viewportOnce,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { KontakChannel, KontakContent } from "@/types/kontak";

type ContactSectionProps = {
  content: KontakContent;
};

const viewport = viewportOnce;
const listVariants = staggerContainer(0.07, 0.04);
const itemVariants = fadeUpSoft;

const VU_HEIGHTS = [38, 62, 44, 78, 52, 70, 40, 86, 48, 66, 42, 74] as const;

/**
 * #kontak — viewport-locked studio contact desk.
 * Plaster surface, radio call-in atmosphere, no ad slot.
 */
export function ContactSection({ content }: ContactSectionProps) {
  const addressLines = content.address.split("\n");

  return (
    <section
      id="kontak"
      data-surface="white"
      className="section-surface-white section-slide relative flex flex-col border-t px-4 pt-[clamp(28px,4vw,48px)] pb-[var(--section-pad-bottom)] sm:px-6 md:pr-10 md:pl-[calc(var(--rail)+2.5rem)]"
    >
      <CallDeskAtmosphere />

      <div className="relative z-[1] mx-auto flex h-full min-h-0 w-full max-w-[1120px] flex-col">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.55, ease: easeOut }}
          className="shrink-0"
        >
          <p className="m-0 inline-flex w-fit items-center bg-[var(--accent)] px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] text-white uppercase">
            {content.eyebrow}
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <h2 className="m-0 text-[clamp(1.9rem,4vw,3.1rem)] leading-[0.98] font-extrabold tracking-[-0.03em]">
              <span className="text-[var(--section-fg)]">{content.title}</span>{" "}
              <span className="text-[var(--accent)]">{content.titleAccent}</span>
            </h2>
            <p className="m-0 max-w-[26rem] text-[0.82rem] leading-relaxed text-[var(--section-muted)]">
              {content.description}
            </p>
          </div>
        </motion.header>

        <div className="mt-5 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-6 xl:gap-8">
          {/* Studio desk — channels + address */}
          <motion.div
            variants={listVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="flex min-h-0 flex-col gap-3 lg:gap-3.5"
          >
            <motion.div
              variants={itemVariants}
              className="grid shrink-0 grid-cols-1 gap-2 min-[400px]:grid-cols-3 min-[400px]:gap-2.5"
            >
              {content.channels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex min-h-0 flex-1 flex-col border border-[rgba(12,12,14,0.14)] bg-[color-mix(in_srgb,var(--section-raised)_72%,transparent)] px-4 py-4 lg:px-5 lg:py-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[9px] font-semibold tracking-[0.2em] text-[var(--section-muted)] uppercase">
                  {content.studioLabel}
                </span>
                <span className="text-[9px] font-bold tracking-[0.18em] text-[var(--accent)] uppercase">
                  {content.frequency}
                </span>
              </div>

              <address className="mt-3 m-0 text-[0.84rem] leading-[1.65] text-[var(--section-fg)] not-italic">
                {addressLines.map((line, index) => (
                  <span key={line}>
                    {line}
                    {index < addressLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </address>

              <p className="mt-3 m-0 border-t border-[rgba(12,12,14,0.1)] pt-3 text-[0.72rem] tracking-[0.04em] text-[var(--section-muted)]">
                {content.operatingHours}
              </p>

              <ul className="mt-3 m-0 flex list-none flex-col gap-2 border-t border-[rgba(12,12,14,0.1)] pt-3 p-0">
                {content.hotlines.map((line) => (
                  <li
                    key={line.label}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5"
                  >
                    <span className="text-[9px] font-semibold tracking-[0.16em] text-[var(--section-muted)] uppercase">
                      {line.label}
                    </span>
                    <a
                      href={line.href}
                      className="text-[0.88rem] font-semibold tracking-[-0.01em] text-[var(--section-fg)] no-underline transition-colors hover:text-[var(--accent)]"
                    >
                      {line.number}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-[rgba(12,12,14,0.1)] pt-3">
                <a
                  href={`mailto:${content.email}`}
                  className="text-[0.78rem] font-medium tracking-[0.04em] text-[var(--section-muted)] no-underline transition-colors hover:text-[var(--section-fg)]"
                >
                  {content.email}
                </a>
                <ul
                  className="m-0 flex list-none items-center p-0"
                  aria-label="Sosial media"
                >
                  {content.socialLinks.map((link, index) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        className={cn(
                          "inline-flex h-9 w-9 items-center justify-center border border-[rgba(12,12,14,0.18)] text-[var(--section-fg)] transition-colors hover:bg-[rgba(12,12,14,0.06)]",
                          index > 0 && "border-l-0",
                        )}
                      >
                        <SocialIcon icon={link.icon} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>

          {/* Message panel → WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.55, delay: 0.06, ease: easeOut }}
            className="flex min-h-0 flex-col border border-[rgba(12,12,14,0.14)] bg-[color-mix(in_srgb,#fff_55%,transparent)] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6"
          >
            <div className="mb-3 flex shrink-0 items-center gap-3">
              <span className="text-[9px] font-semibold tracking-[0.2em] text-[var(--section-muted)] uppercase">
                Kirim pesan
              </span>
              <span
                className="h-px min-w-0 flex-1 border-t border-dotted border-[rgba(12,12,14,0.22)]"
                aria-hidden
              />
              <span className="hidden items-end gap-[2px] sm:inline-flex" aria-hidden>
                {VU_HEIGHTS.slice(0, 8).map((height, index) => (
                  <span
                    key={index}
                    className="kontak-vu-bar w-[2px] bg-[var(--accent)]"
                    style={{
                      height: `${height * 0.22}px`,
                      animationDelay: `${index * 0.11}s`,
                    }}
                  />
                ))}
              </span>
            </div>

            <ContactForm content={content} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ChannelCard({ channel }: { channel: KontakChannel }) {
  return (
    <motion.a
      href={channel.href}
      target={channel.external ? "_blank" : undefined}
      rel={channel.external ? "noopener noreferrer" : undefined}
      whileHover={hoverLift}
      whileTap={tapPress}
      className={cn(
        "group flex min-h-12 flex-row items-center gap-3 border px-3 py-3 no-underline transition-colors min-[400px]:min-h-[5.25rem] min-[400px]:flex-col min-[400px]:items-stretch min-[400px]:justify-between min-[400px]:gap-0 min-[400px]:px-2.5 min-[400px]:py-2.5 sm:px-3 sm:py-3",
        channel.id === "whatsapp"
          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
          : "border-[rgba(12,12,14,0.14)] bg-[color-mix(in_srgb,var(--section-raised)_65%,transparent)] hover:border-[rgba(12,12,14,0.28)]",
      )}
    >
      <span
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center border",
          channel.id === "whatsapp"
            ? "border-[var(--accent)] text-[var(--accent)]"
            : "border-[rgba(12,12,14,0.2)] text-[var(--section-fg)]",
        )}
        aria-hidden
      >
        <ChannelIcon id={channel.id} />
      </span>
      <span>
        <span className="block text-[0.72rem] font-extrabold tracking-[0.06em] text-[var(--section-fg)] uppercase">
          {channel.label}
        </span>
        <span className="mt-0.5 block truncate text-[0.65rem] text-[var(--section-muted)]">
          {channel.detail}
        </span>
      </span>
    </motion.a>
  );
}

function ContactForm({ content }: { content: KontakContent }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const href = buildKontakWhatsAppHref(
      content.whatsappNumber,
      content.form.whatsappTemplate,
      name,
      message,
    );
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col gap-3"
    >
      <label className="flex shrink-0 flex-col gap-1.5">
        <span className="text-[9px] font-semibold tracking-[0.16em] text-[var(--section-muted)] uppercase">
          {content.form.nameLabel}
        </span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={content.form.namePlaceholder}
          className="h-11 border border-[rgba(12,12,14,0.16)] bg-white/70 px-3 text-[0.88rem] text-[var(--section-fg)] outline-none transition-[border-color,box-shadow] placeholder:text-[rgba(18,18,20,0.35)] focus:border-[var(--accent)] focus:shadow-[inset_0_0_0_1px_var(--accent)]"
        />
      </label>

      <label className="flex min-h-0 flex-1 flex-col gap-1.5">
        <span className="text-[9px] font-semibold tracking-[0.16em] text-[var(--section-muted)] uppercase">
          {content.form.messageLabel}
        </span>
        <textarea
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={content.form.messagePlaceholder}
          rows={5}
          className="min-h-[5.5rem] flex-1 resize-none border border-[rgba(12,12,14,0.16)] bg-white/70 px-3 py-2.5 text-[0.88rem] leading-relaxed text-[var(--section-fg)] outline-none transition-[border-color,box-shadow] placeholder:text-[rgba(18,18,20,0.35)] focus:border-[var(--accent)] focus:shadow-[inset_0_0_0_1px_var(--accent)] lg:min-h-[7.5rem]"
        />
      </label>

      <motion.button
        type="submit"
        whileHover={{ y: -2 }}
        whileTap={tapPress}
        className="inline-flex h-12 shrink-0 items-center justify-center gap-2 bg-[var(--accent)] px-5 text-[0.72rem] font-bold tracking-[0.16em] text-white uppercase transition-colors hover:bg-[var(--accent-hover)]"
      >
        <SocialIcon icon="whatsapp" />
        {content.form.submitLabel}
      </motion.button>
    </form>
  );
}

function ChannelIcon({ id }: { id: KontakChannel["id"] }) {
  if (id === "whatsapp") {
    return <SocialIcon icon="whatsapp" />;
  }

  if (id === "email") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3.5"
          y="5.5"
          width="17"
          height="13"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M4 7l8 6 8-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="square"
        />
      </svg>
    );
  }

  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 4.5h3L12 8.5l-2 1.5a10 10 0 0 0 4 4L15.5 12l4 1.5v3a2 2 0 0 1-2.2 2A14.5 14.5 0 0 1 5.5 6.7a2 2 0 0 1 2-2.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/**
 * Call-in desk atmosphere — broadcast rings, soft studio wash, VU cue.
 * Distinct from Tentang loft / Penyiar mic-room / Partner stage.
 */
function CallDeskAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 opacity-[0.16]">
        <Image
          src="/cover-image.png"
          alt=""
          fill
          sizes="100vw"
          className="scale-110 object-cover object-[55%_45%] blur-[2.5px]"
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 48% at 92% 12%, rgba(196,92,38,0.16) 0%, transparent 58%),
            radial-gradient(ellipse 42% 38% at 8% 78%, rgba(12,12,14,0.1) 0%, transparent 55%),
            linear-gradient(155deg, rgba(200,196,186,0.94) 0%, rgba(200,196,186,0.8) 48%, rgba(200,196,186,0.92) 100%)
          `,
        }}
      />

      {/* Signal rings — call desk corner */}
      <div className="absolute right-[-18%] bottom-[-22%] h-[72vmax] w-[72vmax] rounded-full border border-[rgba(12,12,14,0.06)]" />
      <div className="absolute right-[-10%] bottom-[-12%] h-[52vmax] w-[52vmax] rounded-full border border-[rgba(12,12,14,0.05)]" />
      <div className="absolute right-[-2%] bottom-[-2%] h-[34vmax] w-[34vmax] rounded-full border border-[rgba(196,92,38,0.12)]" />

      {/* Waveform arc */}
      <svg
        className="absolute top-[14%] left-[calc(var(--rail)+1rem)] h-20 w-[min(48%,420px)] opacity-[0.1]"
        viewBox="0 0 420 80"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 40 Q26 10 52 40 T104 40 T156 40 T208 40 T260 40 T312 40 T364 40 T416 40"
          stroke="currentColor"
          strokeWidth="1.4"
          className="text-[var(--section-fg)]"
        />
        <path
          d="M0 40 Q26 62 52 40 T104 40 T156 40 T208 40 T260 40 T312 40 T364 40 T416 40"
          stroke="var(--accent)"
          strokeWidth="1"
          opacity="0.7"
        />
      </svg>

      {/* Desk VU meters */}
      <div className="absolute top-[20%] right-[7%] hidden h-16 items-end gap-[3px] opacity-30 md:flex">
        {VU_HEIGHTS.map((height, index) => (
          <span
            key={index}
            className="kontak-vu-bar w-[3px] bg-[rgba(12,12,14,0.7)]"
            style={{
              height: `${height}%`,
              animationDelay: `${index * 0.09}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(12,12,14,0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(12,12,14,0.9) 1px, transparent 1px)
          `,
          backgroundSize: "46px 46px",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.17] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "170px 170px",
        }}
      />

      <p className="absolute bottom-[16%] left-[calc(var(--rail)+1.5rem)] text-[clamp(3rem,9vw,6.5rem)] leading-none font-extrabold tracking-[-0.06em] text-[rgba(12,12,14,0.045)] select-none">
        CALL
      </p>
    </div>
  );
}
