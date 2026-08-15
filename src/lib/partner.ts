import { partnerContent as fallback } from "@/data/partner";
import { headerField, textAllowEmpty } from "@/lib/cms-parse";
import type { PartnerContent, PartnerLogo, SponsorshipPlan } from "@/types/partner";
import type { SectionHeaderContent } from "@/types/site";

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
    unit: row.unit ?? "",
    features: row.features || [],
    ...(row.is_featured ? { featured: true } : {}),
    whatsappMessage: row.whatsapp_message ?? "",
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
  const partners =
    options?.partners != null
      ? options.partners.map(mapPartnerRow)
      : fallback.partners;
  const plans =
    options?.plans != null ? options.plans.map(mapPlanRow) : fallback.plans;

  return {
    eyebrow: headerField(header, "eyebrow", fallback.eyebrow),
    title: headerField(header, "title", fallback.title),
    description: headerField(header, "description", fallback.description),
    historyLabel: textAllowEmpty(section, "history_label", fallback.historyLabel),
    plansLabel: textAllowEmpty(section, "plans_label", fallback.plansLabel),
    moreInfoLabel: textAllowEmpty(
      section,
      "more_info_label",
      fallback.moreInfoLabel,
    ),
    moreInfoHref: textAllowEmpty(section, "more_info_href", fallback.moreInfoHref),
    whatsappNumber: textAllowEmpty(
      section,
      "whatsapp_number",
      fallback.whatsappNumber,
    ),
    planCtaLabel: textAllowEmpty(
      section,
      "plan_cta_label",
      fallback.planCtaLabel,
    ),
    currencyPrefix: textAllowEmpty(
      section,
      "currency_prefix",
      fallback.currencyPrefix,
    ),
    partners,
    plans,
  };
}
