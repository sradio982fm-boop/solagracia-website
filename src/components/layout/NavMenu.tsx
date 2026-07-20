"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import type { SectionId } from "@/data/constants";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/utils";
import type { NavLetter } from "@/types/site";

type NavMenuProps = {
  links: readonly NavLetter[];
  sectionIds: readonly SectionId[];
};

const easeOut = [0.16, 1, 0.3, 1] as const;

/**
 * Frame hamburger + slide-in nav panel for GRACIA sections.
 */
export function NavMenu({ links, sectionIds }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const activeId = useActiveSection(sectionIds, "home");

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="pointer-events-auto fixed z-50 flex h-11 w-11 items-center justify-center border-2 border-[var(--frame-line)] bg-[var(--chrome-bg)] text-[var(--chrome-fg)] transition-[border-color,background-color,color] duration-300 hover:bg-[var(--chrome-hover)] md:h-[var(--frame-control)] md:w-[var(--frame-control)] md:border-t-0 md:border-r-0"
        style={{
          top: "var(--frame-inset-top)",
          right: "max(var(--frame-inset), var(--safe-right))",
        }}
        aria-label={open ? "Tutup navigasi" : "Buka navigasi"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="relative block h-3 w-4 md:h-2.5 md:w-2.5" aria-hidden>
          <motion.span
            className="absolute top-0 left-0 block h-px w-full bg-current"
            animate={
              open
                ? { top: "50%", rotate: 45, y: "-50%" }
                : { top: "0%", rotate: 0, y: "0%" }
            }
            transition={{ duration: 0.25, ease: easeOut }}
          />
          <motion.span
            className="absolute top-1/2 left-0 block h-px w-full -translate-y-1/2 bg-current"
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.15 }}
          />
          <motion.span
            className="absolute bottom-0 left-0 block h-px w-full bg-current"
            animate={
              open
                ? { bottom: "50%", rotate: -45, y: "50%" }
                : { bottom: "0%", rotate: 0, y: "0%" }
            }
            transition={{ duration: 0.25, ease: easeOut }}
          />
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="nav-overlay"
            id={panelId}
            className="fixed inset-0 z-40 flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi situs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
              aria-label="Tutup navigasi"
              onClick={close}
            />

            <motion.nav
              className="relative flex h-full w-full max-w-md flex-col border-l border-[var(--frame-line)] bg-[var(--bg-void)]/95 px-8 py-16 md:px-12"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: easeOut }}
              aria-label="Menu utama"
            >
              <p className="text-[10px] font-medium tracking-[0.32em] text-white/45 uppercase">
                Navigasi
              </p>

              <ul className="mt-10 flex flex-col">
                {links.map((link, index) => {
                  const isActive = link.sectionId === activeId;

                  return (
                    <motion.li
                      key={link.sectionId}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.08 + index * 0.05,
                        ease: easeOut,
                      }}
                      className="border-b border-[var(--frame-line)]"
                    >
                      <a
                        href={link.href}
                        onClick={close}
                        className={cn(
                          "group flex items-baseline gap-5 py-5 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-white/55 hover:text-white",
                        )}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <span className="w-6 text-[13px] font-bold tracking-wide">
                          {link.letter}
                        </span>
                        <span className="text-[clamp(1.35rem,3vw,1.85rem)] font-bold tracking-tight">
                          {link.menuLabel}
                        </span>
                        {isActive ? (
                          <span
                            className="ml-auto h-px w-8 self-center bg-white/70"
                            aria-hidden
                          />
                        ) : null}
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
