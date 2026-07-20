import { partnerContent as fallback } from "@/data/partner";
import type { PartnerContent, PartnerLogo, SponsorshipPlan } from "@/types/partner";
import type { SectionHeaderContent } from "@/types/site";

function text(
  section: Record<string, string | null> | undefined,
  key: string,
  fallbackValue: string,
): string {
  const value = section?.[key];
  return value && value.trim() ? value : fallbackValue;
}

type PartnerRow = {
  id: string;
  name: string;
  initials: string;
  logo_url: string | null;
  href: string | null;
  sort_order: number;
};

type PlanRow = {
  id: string;
  name: string;
  price: string;
  unit: string | null;
  features: string[];
  is_featured: boolean;
  whatsapp_message: string | null;
  sort_order: number;
};

function mapPartnerRow(row: PartnerRow): PartnerLogo {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    ...(row.logo_url ? { logoUrl: row.logo_url } : {}),
    ...(row.href ? { href: row.href } : {}),
  };
}

function mapPlanRow(row: PlanRow): SponsorshipPlan {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    unit: row.unit || "",
    features: row.features || [],
    ...(row.is_featured ? { featured: true } : {}),
    whatsappMessage: row.whatsapp_message || "",
  };
}

export function mapPartnerFromConfig(
  section: Record<string, string | null> | undefined,
  options?: {
    header?: SectionHeaderContent;
    partners?: PartnerRow[] | null;
    plans?: PlanRow[] | null;
  },
): PartnerContent {
  const header = options?.header;
  // Prefer CMS lists; empty array means intentionally empty (no static mock logos/plans)
  const partners =
    options?.partners != null
      ? options.partners.map(mapPartnerRow)
      : fallback.partners;
  const plans =
    options?.plans != null ? options.plans.map(mapPlanRow) : fallback.plans;

  const base: PartnerContent = {
    eyebrow: header?.eyebrow || fallback.eyebrow,
    title: header?.title || fallback.title,
    description: header?.description || fallback.description,
    historyLabel: text(section, "history_label", fallback.historyLabel),
    plansLabel: text(section, "plans_label", fallback.plansLabel),
    moreInfoLabel: text(section, "more_info_label", fallback.moreInfoLabel),
    moreInfoHref: text(section, "more_info_href", fallback.moreInfoHref),
    whatsappNumber: text(section, "whatsapp_number", fallback.whatsappNumber),
    planCtaLabel: text(section, "plan_cta_label", fallback.planCtaLabel),
    currencyPrefix: text(section, "currency_prefix", fallback.currencyPrefix),
    partners,
    plans,
  };

  return base;
}
