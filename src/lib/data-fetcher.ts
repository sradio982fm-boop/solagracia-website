import { cache } from "react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { heroContent as fallbackHero } from "@/data/hero";
import { mediaPlayerContent as fallbackMedia } from "@/data/media";
import { site as fallbackSite } from "@/data/site";
import type { SocialRow } from "@/lib/social";
import { mapFooterFromConfig, mapMarqueeFromConfig } from "@/lib/footer";
import { mapKontakFromConfig } from "@/lib/kontak";
import {
  mapPrivacyFromConfig,
  PRIVACY_FOOTER_LINK_DEFAULT,
  PRIVACY_FOOTER_LINK_KEY,
  type PrivacyContent,
} from "@/lib/legal";
import {
  boolAllowEmpty,
  parseJsonArrayAllowEmpty,
  textAllowEmpty,
} from "@/lib/cms-parse";
import {
  buildOnAirFromSlots,
  buildProgramFromSlots,
  type SlotRow,
} from "@/lib/schedule-cms";
import { mapTentangFromConfig } from "@/lib/tentang";
import { mapPartnerFromConfig } from "@/lib/partner";
import {
  AD_CAPABLE_SECTIONS,
  buildSectionAdsFromRows,
  isAdScheduledActive,
  type AdSlotRow,
} from "@/lib/ads";
import {
  adSlotRowToPromoSource,
  isAdCapableSection,
  isAdPromoId,
  mergeAdPromoSource,
  parseAdPromoSearchParams,
  type AdPromoSource,
} from "@/lib/ad-promo";
import type { SectionId } from "@/data/constants";
import {
  buildFallbackSectionConfig,
  buildSectionConfigPayload,
  mapSectionConfigRow,
  type SectionConfigPayload,
} from "@/lib/section-config";
import type { AdPlaceholder } from "@/types/ads";
import { penyiarContent as fallbackPenyiar } from "@/data/penyiar";
import { scheduleContent as fallbackOnAir } from "@/data/schedule";
import type { PartnerContent } from "@/types/partner";
import type { KontakContent } from "@/types/kontak";
import type { PenyiarContent } from "@/types/penyiar";
import type { OnAirContent, ProgramContent, WeekdayId } from "@/types/schedule";
import type {
  BrandContent,
  FooterContent,
  FooterLink,
  FrequencyOption,
  HeroContent,
  HeroCta,
  MediaPlayerContent,
  PlayerPayload,
  SectionHeaderContent,
  SeoContent,
  SocialLink,
  TentangContent,
} from "@/types/site";

const WEEKDAY_TO_JS: Record<WeekdayId, number> = {
  minggu: 0,
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  sabtu: 6,
};

function toFrequencyOption(row: {
  id: string;
  label: string | null;
  station_name: string | null;
  audio_url: string | null;
  video_url: string | null;
  poster_url: string | null;
  show_video?: boolean | null;
  is_default: boolean | null;
}): FrequencyOption {
  return {
    id: row.id,
    label: row.label ?? fallbackMedia.frequency,
    stationName: row.station_name ?? fallbackMedia.stationName,
    audioSrc: row.audio_url || fallbackMedia.audioSrc,
    videoSrc: row.video_url ?? fallbackMedia.videoSrc,
    videoPoster: row.poster_url ?? fallbackMedia.videoPoster,
    showVideo: row.show_video !== false,
    isDefault: Boolean(row.is_default),
  };
}

function contentFromFrequency(
  freq: FrequencyOption,
  liveShowTitle?: string | null,
): MediaPlayerContent {
  return {
    stationName: freq.stationName,
    showTitle: liveShowTitle || fallbackMedia.showTitle,
    frequency: freq.label,
    audioSrc: freq.audioSrc,
    videoSrc: freq.videoSrc,
    videoPoster: freq.videoPoster,
  };
}

/**
 * All active frequencies for the sticky player switcher.
 * Falls back to static media.ts (siar.us) on error/empty.
 */
export async function fetchPlayerPayload(
  liveShowTitle?: string | null,
): Promise<PlayerPayload> {
  const fallbackFreq: FrequencyOption = {
    id: "fallback",
    label: fallbackMedia.frequency,
    stationName: fallbackMedia.stationName,
    audioSrc: fallbackMedia.audioSrc,
    videoSrc: fallbackMedia.videoSrc,
    videoPoster: fallbackMedia.videoPoster,
    showVideo: true,
    isDefault: true,
  };

  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("frequencies")
      .select("*")
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return {
        showTitle: liveShowTitle || fallbackMedia.showTitle,
        frequencies: [fallbackFreq],
        content: withShowTitle(fallbackMedia, liveShowTitle),
      };
    }

    const frequencies = data.map(toFrequencyOption);
    const selected = frequencies.find((f) => f.isDefault) || frequencies[0];

    return {
      showTitle: liveShowTitle || fallbackMedia.showTitle,
      frequencies,
      content: contentFromFrequency(selected, liveShowTitle),
    };
  } catch {
    return {
      showTitle: liveShowTitle || fallbackMedia.showTitle,
      frequencies: [fallbackFreq],
      content: withShowTitle(fallbackMedia, liveShowTitle),
    };
  }
}

/** @deprecated Prefer fetchPlayerPayload — kept for callers that need one blob. */
export async function fetchMediaPlayerContent(
  liveShowTitle?: string | null,
): Promise<MediaPlayerContent> {
  const payload = await fetchPlayerPayload(liveShowTitle);
  return payload.content;
}

/** Active social links — single source for hero / kontak / footer. */
export async function fetchSocialLinks(): Promise<SocialRow[]> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("social_links")
      .select("platform, label, url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) return [];
    return data.map((row) => ({
      platform: row.platform,
      label: row.label,
      url: row.url,
    }));
  } catch {
    return [];
  }
}

function withShowTitle(
  base: MediaPlayerContent,
  liveShowTitle?: string | null,
): MediaPlayerContent {
  if (!liveShowTitle) return base;
  return { ...base, showTitle: liveShowTitle };
}

type RawConfig = Record<string, Record<string, string | null>>;

function parseHeroCtas(
  section: Record<string, string | null> | undefined,
  key: string,
): HeroCta[] {
  return parseJsonArrayAllowEmpty<HeroCta>(
    section,
    key,
    fallbackHero.ctas,
  ).filter(
    (cta): cta is HeroCta =>
      typeof cta?.label === "string" && typeof cta?.href === "string",
  );
}

const fetchRawSiteConfig = cache(async (): Promise<RawConfig> => {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_config")
      .select("section, key, value");

    if (error || !data?.length) return {};

    const grouped: RawConfig = {};
    for (const row of data) {
      if (!grouped[row.section]) grouped[row.section] = {};
      grouped[row.section][row.key] = row.value;
    }
    return grouped;
  } catch {
    return {};
  }
});

export async function fetchSeoContent(): Promise<SeoContent> {
  try {
    const config = await fetchRawSiteConfig();
    const seo = config.seo;
    return {
      siteName: textAllowEmpty(seo, "site_name", fallbackSite.name),
      parentName: textAllowEmpty(seo, "parent_name", fallbackSite.parent),
      title: textAllowEmpty(seo, "title", fallbackSite.title),
      subtitle: textAllowEmpty(seo, "subtitle", ""),
      description: textAllowEmpty(seo, "description", fallbackSite.description),
      ogImageUrl: textAllowEmpty(seo, "og_image_url", "/cover-image.png"),
      faviconUrl: textAllowEmpty(seo, "favicon_url", "/favicon.ico"),
    };
  } catch {
    return {
      siteName: fallbackSite.name,
      parentName: fallbackSite.parent,
      title: fallbackSite.title,
      subtitle: "",
      description: fallbackSite.description,
      ogImageUrl: "/cover-image.png",
      faviconUrl: "/favicon.ico",
    };
  }
}

export async function fetchBrandContent(): Promise<BrandContent> {
  try {
    const config = await fetchRawSiteConfig();
    const brand = config.brand;
    return {
      displayName: textAllowEmpty(brand, "display_name", fallbackSite.name),
      frequencyLabel: textAllowEmpty(brand, "frequency_label", "98.2 FM"),
      parentSiteUrl: textAllowEmpty(brand, "parent_site_url", ""),
      parentSiteLabel: textAllowEmpty(brand, "parent_site_label", "S Radio 98.2FM Streaming"),
    };
  } catch {
    return {
      displayName: fallbackSite.name,
      frequencyLabel: "98.2 FM",
      parentSiteUrl: "",
      parentSiteLabel: "S Radio 98.2FM Streaming",
    };
  }
}

/** Hero copy from site_config.hero — socials injected by caller. */
export async function fetchHeroContent(
  socialLinks: SocialLink[] = fallbackHero.socialLinks,
): Promise<HeroContent> {
  try {
    const config = await fetchRawSiteConfig();
    const hero = config.hero;
    if (!hero || Object.keys(hero).length === 0) {
      return { ...fallbackHero, socialLinks };
    }

    return {
      brand: textAllowEmpty(hero, "brand", fallbackHero.brand),
      // Explicit empty clears eyebrow — do not revive fallback.
      eyebrow: textAllowEmpty(hero, "eyebrow", fallbackHero.eyebrow),
      support: textAllowEmpty(hero, "support", fallbackHero.support),
      verticalTagline: textAllowEmpty(
        hero,
        "vertical_tagline",
        fallbackHero.verticalTagline,
      ),
      coverSrc: textAllowEmpty(hero, "cover_url", fallbackHero.coverSrc),
      // Explicit empty alt stays empty (component uses brand as last resort).
      coverAlt: textAllowEmpty(hero, "cover_alt", fallbackHero.coverAlt),
      logoSrc: textAllowEmpty(hero, "logo_url", fallbackHero.logoSrc),
      ctas: parseHeroCtas(hero, "ctas"),
      mobileCtaLabel: textAllowEmpty(
        hero,
        "mobile_cta_label",
        fallbackHero.mobileCtaLabel,
      ),
      mobileCtaHref: textAllowEmpty(
        hero,
        "mobile_cta_href",
        fallbackHero.mobileCtaHref,
      ),
      socialLinks,
    };
  } catch {
    return { ...fallbackHero, socialLinks };
  }
}

export async function fetchTentangContent(
  frequencyLabel?: string,
): Promise<TentangContent> {
  try {
    const config = await fetchRawSiteConfig();
    return mapTentangFromConfig(config.tentang, frequencyLabel);
  } catch {
    return mapTentangFromConfig(undefined, frequencyLabel);
  }
}

export async function fetchKontakContent(options?: {
  socialLinks?: SocialLink[];
  frequencyLabel?: string;
  header?: SectionHeaderContent;
}): Promise<KontakContent> {
  try {
    const config = await fetchRawSiteConfig();
    return mapKontakFromConfig(config.contact, options);
  } catch {
    return mapKontakFromConfig(undefined, options);
  }
}

export async function fetchFooterContent(options?: {
  socialLinks?: FooterLink[];
  exploreLinks?: FooterLink[];
}): Promise<FooterContent> {
  try {
    const config = await fetchRawSiteConfig();
    return mapFooterFromConfig(config.footer, {
      ...options,
      showPrivacyLink: boolAllowEmpty(
        config.legal,
        PRIVACY_FOOTER_LINK_KEY,
        PRIVACY_FOOTER_LINK_DEFAULT,
      ),
    });
  } catch {
    return mapFooterFromConfig(undefined, options);
  }
}

export async function fetchMarqueeItems(): Promise<string[]> {
  try {
    const config = await fetchRawSiteConfig();
    return mapMarqueeFromConfig(config.marquee);
  } catch {
    return mapMarqueeFromConfig(undefined);
  }
}

export async function fetchPrivacyContent(): Promise<PrivacyContent> {
  try {
    const config = await fetchRawSiteConfig();
    return mapPrivacyFromConfig(config.legal);
  } catch {
    return mapPrivacyFromConfig(undefined);
  }
}

export async function fetchPartnerContent(
  header?: SectionHeaderContent,
): Promise<PartnerContent> {
  try {
    const supabase = createSupabaseAdmin();
    const [config, partnersRes, plansRes] = await Promise.all([
      fetchRawSiteConfig(),
      supabase
        .from("partners")
        .select("id, name, initials, logo_url, href, sort_order")
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
      supabase
        .from("sponsorship_plans")
        .select(
          "id, name, price, unit, features, is_featured, whatsapp_message, sort_order",
        )
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .limit(3),
    ]);

    return mapPartnerFromConfig(config.partner, {
      header,
      partners: partnersRes.data ?? [],
      plans: plansRes.data ?? [],
    });
  } catch {
    // Network/config failure only — empty lists, not seeded mock logos/plans
    return mapPartnerFromConfig(undefined, {
      header,
      partners: [],
      plans: [],
    });
  }
}

export async function fetchPenyiarContent(header?: {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  description?: string;
}): Promise<PenyiarContent> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("hosts")
      .select(
        "id, name, role_title, tagline, tags, photo_url, photo_alt, display_number, href, sort_order",
      )
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error) {
      return {
        ...fallbackPenyiar,
        hosts: [],
        ...(header
          ? {
              eyebrow: header.eyebrow ?? "",
              title: header.title ?? "",
              titleAccent: header.titleAccent ?? "",
              description: header.description ?? "",
            }
          : {}),
      };
    }

    return {
      eyebrow: header ? (header.eyebrow ?? "") : fallbackPenyiar.eyebrow,
      title: header ? (header.title ?? "") : fallbackPenyiar.title,
      titleAccent: header
        ? (header.titleAccent ?? "")
        : fallbackPenyiar.titleAccent,
      description: header
        ? (header.description ?? "")
        : fallbackPenyiar.description,
      hosts: (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role_title || "",
        tagline: row.tagline || "",
        tags: row.tags || [],
        imageSrc: row.photo_url || "/cover-image.png",
        imageAlt: row.photo_alt || `${row.name} — penyiar Solagracia`,
        number: row.display_number || "",
        href: row.href || "#penyiar",
      })),
    };
  } catch {
    return { ...fallbackPenyiar, hosts: [] };
  }
}

async function fetchScheduleSlots(dayOfWeek?: number): Promise<SlotRow[]> {
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from("schedule_slots")
    .select(
      `
      id,
      day_of_week,
      start_hour,
      end_hour,
      sort_order,
      shows!inner (
        id,
        title,
        description,
        cover_url,
        tag,
        status,
        hosts ( name )
      )
    `,
    )
    .eq("shows.status", "published")
    .order("sort_order", { ascending: true })
    .order("start_hour", { ascending: true });

  if (dayOfWeek !== undefined) {
    query = query.eq("day_of_week", dayOfWeek);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => {
    const showRaw = Array.isArray(row.shows) ? row.shows[0] : row.shows;
    const hostRaw = showRaw?.hosts;
    const host = Array.isArray(hostRaw) ? hostRaw[0] : hostRaw;

    return {
      id: row.id,
      day_of_week: row.day_of_week,
      start_hour: Number(row.start_hour),
      end_hour: Number(row.end_hour),
      sort_order: row.sort_order ?? 0,
      shows: showRaw
        ? {
            id: showRaw.id,
            title: showRaw.title,
            description: showRaw.description,
            cover_url: showRaw.cover_url,
            tag: showRaw.tag,
            hosts: host ? { name: host.name } : null,
          }
        : null,
    };
  });
}

export async function fetchProgramContent(options?: {
  header?: SectionHeaderContent;
  frequencyLabel?: string;
}): Promise<ProgramContent> {
  try {
    const slots = await fetchScheduleSlots();
    return buildProgramFromSlots(slots, {
      eyebrow: options?.header?.eyebrow,
      title: options?.header?.title,
      description: options?.header?.description,
      frequencyLabel: options?.frequencyLabel,
    });
  } catch {
    return buildProgramFromSlots([], {
      eyebrow: options?.header?.eyebrow,
      title: options?.header?.title,
      description: options?.header?.description,
      frequencyLabel: options?.frequencyLabel,
    });
  }
}

export async function fetchOnAirContent(
  todayId: WeekdayId,
): Promise<OnAirContent> {
  try {
    const [slots, config] = await Promise.all([
      fetchScheduleSlots(WEEKDAY_TO_JS[todayId]),
      fetchRawSiteConfig(),
    ]);
    const onAir = config.on_air;
    return buildOnAirFromSlots(slots, {
      label: textAllowEmpty(onAir, "label", fallbackOnAir.label),
      upcomingLabel: textAllowEmpty(
        onAir,
        "upcoming_label",
        fallbackOnAir.upcomingLabel,
      ),
      fallbackTitle: textAllowEmpty(
        onAir,
        "fallback_title",
        fallbackOnAir.fallbackTitle,
      ),
    });
  } catch {
    return buildOnAirFromSlots([]);
  }
}

export async function fetchSectionHeaders(): Promise<
  Record<string, SectionHeaderContent>
> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("section_headers")
      .select("section, eyebrow, title, title_accent, description");

    if (error || !data?.length) return {};

    const headers: Record<string, SectionHeaderContent> = {};
    for (const row of data) {
      headers[row.section] = {
        eyebrow: row.eyebrow ?? "",
        title: row.title ?? "",
        titleAccent: row.title_accent ?? "",
        description: row.description ?? "",
      };
    }
    return headers;
  } catch {
    return {};
  }
}

function applyHeader<T extends {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  description?: string;
}>(content: T, header?: SectionHeaderContent): T {
  if (!header) return content;
  return {
    ...content,
    eyebrow: header.eyebrow,
    title: header.title,
    titleAccent: header.titleAccent,
    description: header.description,
  };
}

export { applyHeader };

/** Section order, visibility, and GRACIA nav metadata. */
export async function fetchSectionConfig(): Promise<SectionConfigPayload> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("section_config")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data?.length) return buildFallbackSectionConfig();

    return buildSectionConfigPayload(
      data.map((row) =>
        mapSectionConfigRow({
          id: String(row.id),
          section: String(row.section),
          is_visible: Boolean(row.is_visible),
          sort_order: Number(row.sort_order),
          letter: (row.letter as string | null) ?? null,
          nav_label: (row.nav_label as string | null) ?? null,
          menu_label: (row.menu_label as string | null) ?? null,
          surface: (row.surface as string | null) ?? null,
          updated_at: row.updated_at ? String(row.updated_at) : undefined,
        }),
      ),
    );
  } catch {
    return buildFallbackSectionConfig();
  }
}

/**
 * Section ad plates — live CMS first, else `/public/ads` via SECTION_ADS.
 * Empty DB / fetch failure still returns static fallbacks for tentang/program/penyiar.
 */
export async function fetchSectionAds(): Promise<
  Partial<Record<SectionId, AdPlaceholder>>
> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("ad_slots")
      .select("*")
      .in("section_id", [...AD_CAPABLE_SECTIONS])
      .order("sort_order", { ascending: true });

    if (error) {
      return buildSectionAdsFromRows([]);
    }

    return buildSectionAdsFromRows((data ?? []) as AdSlotRow[]);
  } catch {
    return buildSectionAdsFromRows([]);
  }
}

type AdPromoRow = Pick<
  AdSlotRow,
  "id" | "section_id" | "sponsor" | "label" | "line" | "starts_at" | "ends_at"
>;

async function fetchPublishedAdById(id: string): Promise<AdPromoRow | null> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("ad_slots")
      .select("id, section_id, sponsor, label, line, starts_at, ends_at")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return null;
    const row = data as AdPromoRow;
    if (!isAdScheduledActive(row)) return null;
    return row;
  } catch {
    return null;
  }
}

async function fetchLiveAdForSection(
  sectionId: string,
): Promise<AdPromoRow | null> {
  if (!isAdCapableSection(sectionId)) return null;
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("ad_slots")
      .select("id, section_id, sponsor, label, line, starts_at, ends_at, is_visible, sort_order")
      .eq("section_id", sectionId)
      .eq("status", "published")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) return null;
    const live = (data as (AdPromoRow & { is_visible: boolean })[]).find(
      (row) => isAdScheduledActive(row),
    );
    return live ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve /iklan query params against `ad_slots`.
 * Prefer DB by id; else live published slot for `from`; else URL params.
 */
export async function resolveAdPromoSource(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<AdPromoSource> {
  const parsed = parseAdPromoSearchParams(searchParams);

  if (isAdPromoId(parsed.id)) {
    const row = await fetchPublishedAdById(parsed.id!);
    if (row) return mergeAdPromoSource(parsed, adSlotRowToPromoSource(row));
  }

  if (isAdCapableSection(parsed.from)) {
    const live = await fetchLiveAdForSection(parsed.from);
    if (live) return mergeAdPromoSource(parsed, adSlotRowToPromoSource(live));
  }

  return parsed;
}

