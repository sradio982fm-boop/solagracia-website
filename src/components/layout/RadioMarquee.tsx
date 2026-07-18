import { marqueeItems } from "@/data/marquee";

type RadioMarqueeProps = {
  items?: readonly string[];
};

/**
 * Stylish station tickertape — bridges dark schedule → plaster penyiar.
 */
export function RadioMarquee({ items = marqueeItems }: RadioMarqueeProps) {
  const sequence = [...items, ...items];

  return (
    <div
      className="radio-marquee relative z-[1] overflow-hidden border-y border-[rgba(255,255,255,0.12)] bg-[var(--bg-void)] text-white"
      aria-hidden
    >
      {/* Soft ember edge wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(196,92,38,0.22) 0%, transparent 18%, transparent 82%, rgba(196,92,38,0.18) 100%)",
        }}
      />

      <div className="radio-marquee__track flex w-max items-center py-3.5 md:py-4">
        {sequence.map((item, index) => {
          const outline = index % 2 === 1;
          return (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-5 pr-5 md:gap-7 md:pr-7"
            >
              <span
                className={
                  outline
                    ? "text-[clamp(1.05rem,2.2vw,1.55rem)] font-extrabold tracking-[0.08em] text-transparent uppercase italic [-webkit-text-stroke:1.2px_rgba(244,244,246,0.75)]"
                    : "text-[clamp(1.05rem,2.2vw,1.55rem)] font-extrabold tracking-[0.06em] text-white uppercase italic"
                }
              >
                {item}
              </span>
              <MarqueeMark />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function MarqueeMark() {
  return (
    <span className="inline-flex items-center gap-2 text-[var(--accent)]" aria-hidden>
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)] opacity-45" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      </span>
      <span className="flex h-3 items-end gap-[2px]">
        <span className="radio-marquee__bar h-2 w-[2px] bg-current" />
        <span className="radio-marquee__bar h-3 w-[2px] bg-current [animation-delay:120ms]" />
        <span className="radio-marquee__bar h-1.5 w-[2px] bg-current [animation-delay:240ms]" />
      </span>
    </span>
  );
}
