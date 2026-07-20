"use client";

import { SiteConfigPageShell } from "@/components/admin/SiteConfigPageShell";
import { FooterConfigPanel } from "@/components/admin/FooterConfigPanel";

export default function SiteFooterPage() {
  return (
    <SiteConfigPageShell
      title="Footer & Marquee"
      description="Footer columns, legal links, dan radio marquee."
    >
      {({ config, saving, save }) => (
        <FooterConfigPanel config={config} saving={saving} onSave={save} />
      )}
    </SiteConfigPageShell>
  );
}
