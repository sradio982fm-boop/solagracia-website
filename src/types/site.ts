export type NavLetter = {
  letter: string;
  label: string;
  /** Full name shown in the hamburger menu panel */
  menuLabel: string;
  href: string;
  sectionId: string;
};

export type HeroCta = {
  label: string;
  href: string;
  variant: "text" | "icon";
  icon?: "phone" | "arrow";
};

export type SocialIconId =
  | "tiktok"
  | "instagram"
  | "whatsapp"
  | "youtube"
  | "x"
  | "facebook"
  | "spotify"
  | "link";

export type SocialLink = {
  label: string;
  href: string;
  icon: SocialIconId;
};

export type HeroContent = {
  brand: string;
  support: string;
  eyebrow: string;
  verticalTagline: string;
  coverSrc: string;
  coverAlt: string;
  logoSrc: string;
  ctas: HeroCta[];
  mobileCtaLabel: string;
  mobileCtaHref: string;
  socialLinks: SocialLink[];
};

export type SectionHeaderContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
};

export type SeoContent = {
  siteName: string;
  parentName: string;
  title: string;
  subtitle: string;
  description: string;
  ogImageUrl: string;
  faviconUrl: string;
};

export type BrandContent = {
  displayName: string;
  frequencyLabel: string;
};

export type MediaPlayerContent = {
  stationName: string;
  showTitle: string;
  frequency: string;
  /** Live / on-demand audio stream */
  audioSrc: string;
  /** Studio camera / live video feed */
  videoSrc: string;
  videoPoster?: string;
};

export type TentangStat = {
  value: string;
  label: string;
};

export type TentangCta = {
  label: string;
  href: string;
  variant: "primary" | "ghost";
};

export type SocialQuotePart =
  | { type: "text"; value: string }
  | { type: "mention"; value: string }
  | { type: "link"; value: string; href: string };

export type SocialTestimonial = {
  platform: "x" | "threads";
  date: string;
  quote: SocialQuotePart[];
  authorName: string;
  authorHandle: string;
  authorInitials: string;
  href: string;
};

export type TentangContent = {
  headline: string;
  /** Phrase inside headline rendered in accent ember */
  headlineAccent: string;
  /** Brand frequency SoT — e.g. `98.2 FM` */
  frequencyLabel?: string;
  body: string[];
  stats: TentangStat[];
  ctas: TentangCta[];
  /** Right-rail social proof (replaces episode list) */
  socialLabel: string;
  testimonial: SocialTestimonial;
};

export type FooterLink = {
  href: string;
  label: string;
};

export type FooterContent = {
  brandTitle: string;
  brandDescription: string;
  /** Use `{year}` placeholder */
  copyrightText: string;
  listenHref: string;
  listenLabel: string;
  contactHref: string;
  contactLabel: string;
  columnIkuti: string;
  columnJelajahi: string;
  wordmark: string;
  wordmarkSub: string;
  exploreLinks: FooterLink[];
  legalLinks: FooterLink[];
  socialLinks: FooterLink[];
};
