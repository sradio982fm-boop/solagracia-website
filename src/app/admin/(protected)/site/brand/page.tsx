"use client";

import { SiteConfigPageShell } from "@/components/admin/SiteConfigPageShell";
import {
  BRAND_FIELDS,
  SiteConfigFieldsPanel,
} from "@/components/admin/SiteConfigFieldsPanel";

export default function SiteBrandPage() {
  return (
    <SiteConfigPageShell
      title="Brand"
      description="Display name dan frequency label untuk stempel studio."
    >
      {({ config, saving, save }) => (
        <SiteConfigFieldsPanel
          section="brand"
          fields={BRAND_FIELDS}
          config={config}
          saving={saving}
          onSave={save}
        />
      )}
    </SiteConfigPageShell>
  );
}
