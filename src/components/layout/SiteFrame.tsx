/**
 * Persistent viewport frame — outer box only.
 * Menu toggle: NavMenu. Section arrows: SectionNav (above the radio player).
 */
export function SiteFrame() {
  return (
    <div
      className="pointer-events-none fixed z-30 hidden border border-[var(--frame-line)] transition-[border-color] duration-300 md:block"
      style={{
        top: "var(--frame-inset)",
        bottom: "var(--frame-inset)",
        left: "var(--frame-inset)",
        right: "var(--frame-inset)",
      }}
    >
      {/* Reserve top-right cell for the hamburger */}
      <div
        className="absolute top-0 right-0 h-[var(--frame-control)] w-[var(--frame-control)] border-b border-l border-[var(--frame-line)] transition-[border-color] duration-300"
        aria-hidden
      />
    </div>
  );
}
