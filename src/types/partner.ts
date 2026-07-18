export type PartnerLogo = {
  id: string;
  name: string;
  initials: string;
};

export type SponsorshipPlan = {
  id: string;
  name: string;
  price: string;
  unit: string;
  features: string[];
  featured?: boolean;
  whatsappMessage: string;
};

export type PartnerContent = {
  eyebrow: string;
  title: string;
  description: string;
  historyLabel: string;
  plansLabel: string;
  moreInfoLabel: string;
  moreInfoHref: string;
  /** Digits only, country code included — e.g. 628811982982 */
  whatsappNumber: string;
  partners: PartnerLogo[];
  plans: SponsorshipPlan[];
};
