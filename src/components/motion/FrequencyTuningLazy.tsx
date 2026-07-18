"use client";

import dynamic from "next/dynamic";

/** Client-only gate — `ssr: false` is invalid in Server Components. */
export const FrequencyTuningLazy = dynamic(
  () =>
    import("@/components/motion/FrequencyTuning").then(
      (mod) => mod.FrequencyTuning,
    ),
  { ssr: false },
);
