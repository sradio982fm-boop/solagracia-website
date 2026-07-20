"use client";

import { SiteConfigPageShell } from "@/components/admin/SiteConfigPageShell";
import {
  SEO_FIELDS,
  SiteConfigFieldsPanel,
} from "@/components/admin/SiteConfigFieldsPanel";

export default function SiteSeoPage() {
  return (
    <SiteConfigPageShell
      title="SEO & Identitas"
      description="Nama situs, title, description, OG image, dan favicon."
    >
      {({ config, saving, save }) => (
        <SiteConfigFieldsPanel
          section="seo"
          fields={SEO_FIELDS}
          config={config}
          saving={saving}
          onSave={save}
        />
      )}
    </SiteConfigPageShell>
  );
}
