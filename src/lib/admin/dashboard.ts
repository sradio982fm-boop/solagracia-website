export type DashboardIssue = {
  severity: "warning" | "error";
  message: string;
  href?: string;
};

export type DashboardStats = {
  counts: {
    hosts: { total: number; published: number; draft: number };
    shows: { total: number; published: number; draft: number };
    scheduleSlots: number;
    partners: { total: number; published: number };
    sponsorshipPlans: { total: number; published: number };
    ads: { total: number; published: number; hidden: number };
    socialLinks: { total: number; active: number };
    frequencies: { total: number; active: number; hasDefault: boolean };
    sections: { total: number; visible: number; hidden: number };
  };
  issues: DashboardIssue[];
};
