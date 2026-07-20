"use client";

import { SiteConfigPageShell } from "@/components/admin/SiteConfigPageShell";
import {
  HERO_FIELDS,
  SiteConfigFieldsPanel,
} from "@/components/admin/SiteConfigFieldsPanel";

export default function SiteHeroPage() {
  return (
    <SiteConfigPageShell
      title="Hero"
      description="Cover, logo, tagline, dan CTA di homepage."
    >
      {({ config, saving, save }) => (
        <SiteConfigFieldsPanel
          section="hero"
          fields={HERO_FIELDS}
          config={config}
          saving={saving}
          onSave={save}
        />
      )}
    </SiteConfigPageShell>
  );
}
