import {
  LETTER_NAV,
  SECTION_SURFACE,
  type SectionId,
  type SectionSurface,
} from "@/data/constants";
import type { FooterLink } from "@/types/site";
import type { NavLetter } from "@/types/site";

export type SectionConfigRow = {
  id: string;
  section: string;
  isVisible: boolean;
  sortOrder: number;
  letter: string | null;
  navLabel: string | null;
  menuLabel: string | null;
  surface: SectionSurface | null;
  updatedAt?: string;
};

export const ALL_SECTION_KEYS = [
  "home",
  "tentang",
  "program",
  "penyiar",
  "partner",
  "kontak",
] as const;

export type PublicSectionKey = (typeof ALL_SECTION_KEYS)[number];

export const PINNED_SECTION: PublicSectionKey = "home";

export const REORDERABLE_SECTIONS: ReadonlyArray<{
  key: PublicSectionKey;
  label: string;
}> = [
  { key: "tentang", label: "Tentang Kami" },
  { key: "program", label: "Program / Jadwal" },
  { key: "penyiar", label: "Penyiar" },
  { key: "partner", label: "Partner" },
  { key: "kontak", label: "Kontak" },
];

const fallbackNavBySection = Object.fromEntries(
  LETTER_NAV.map((link) => [link.sectionId, link]),
) as Record<PublicSectionKey, NavLetter>;

function isValidSurface(value: string | null): value is SectionSurface {
  return value === "dark" || value === "smoke" || value === "white";
}

export function mapSectionConfigRow(row: {
  id: string;
  section: string;
  is_visible: boolean;
  sort_order: number;
  letter: string | null;
  nav_label: string | null;
  menu_label: string | null;
  surface: string | null;
  updated_at?: string;
}): SectionConfigRow {
  return {
    id: row.id,
    section: row.section,
    isVisible: row.is_visible,
    sortOrder: row.sort_order,
    letter: row.letter,
    navLabel: row.nav_label,
    menuLabel: row.menu_label,
    surface: isValidSurface(row.surface) ? row.surface : null,
    updatedAt: row.updated_at,
  };
}

export type SectionConfigPayload = {
  sections: SectionConfigRow[];
  nav: NavLetter[];
  sectionIds: SectionId[];
  surfaces: Record<SectionId, SectionSurface>;
};

function mergeWithFallback(rows: SectionConfigRow[]): SectionConfigRow[] {
  const bySection = new Map(rows.map((row) => [row.section, row]));

  return ALL_SECTION_KEYS.map((key, index) => {
    const existing = bySection.get(key);
    if (existing) return existing;

    const fallback = fallbackNavBySection[key];
    return {
      id: "",
      section: key,
      isVisible: true,
      sortOrder: index,
      letter: fallback.letter,
      navLabel: fallback.label,
      menuLabel: fallback.menuLabel,
      surface: SECTION_SURFACE[key],
    };
  });
}

export function buildSectionConfigPayload(
  rows: SectionConfigRow[],
): SectionConfigPayload {
  const merged = mergeWithFallback(rows);
  const visible = merged
    .filter((row) => row.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const nav: NavLetter[] = visible.map((row) => {
    const fallback = fallbackNavBySection[row.section as PublicSectionKey];
    const sectionId = row.section as PublicSectionKey;

    return {
      letter: row.letter?.trim() || fallback?.letter || sectionId[0].toUpperCase(),
      label: row.navLabel?.trim() || fallback?.label || sectionId,
      menuLabel:
        row.menuLabel?.trim() || fallback?.menuLabel || fallback?.label || sectionId,
      href: `#${sectionId}`,
      sectionId,
    };
  });

  const sectionIds = nav.map((link) => link.sectionId as SectionId);
  const surfaces = {} as Record<SectionId, SectionSurface>;

  for (const row of visible) {
    const id = row.section as SectionId;
    surfaces[id] =
      row.surface ?? SECTION_SURFACE[id] ?? ("white" as SectionSurface);
  }

  return { sections: merged, nav, sectionIds, surfaces };
}

export function buildFallbackSectionConfig(): SectionConfigPayload {
  return buildSectionConfigPayload(
    ALL_SECTION_KEYS.map((key, index) => {
      const fallback = fallbackNavBySection[key];
      return {
        id: "",
        section: key,
        isVisible: true,
        sortOrder: index,
        letter: fallback.letter,
        navLabel: fallback.label,
        menuLabel: fallback.menuLabel,
        surface: SECTION_SURFACE[key],
      };
    }),
  );
}

export function buildExploreLinks(nav: readonly NavLetter[]): FooterLink[] {
  return nav.map((link) => ({
    href: link.href,
    label: link.menuLabel,
  }));
}

export function orderedVisibleSectionKeys(
  sections: SectionConfigRow[],
): PublicSectionKey[] {
  return mergeWithFallback(sections)
    .filter((row) => row.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((row) => row.section as PublicSectionKey);
}
