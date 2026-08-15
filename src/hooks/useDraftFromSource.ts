import { useState, type Dispatch, type SetStateAction } from "react";

/**
 * Keep a local editable draft in sync when `source` identity changes.
 * Adjusts state during render (React-supported) instead of useEffect.
 */
export function useDraftFromSource<Source, Draft>(
  source: Source,
  toDraft: (source: Source) => Draft,
): [Draft, Dispatch<SetStateAction<Draft>>] {
  const [draft, setDraft] = useState(() => toDraft(source));
  const [sourceRef, setSourceRef] = useState(source);

  if (source !== sourceRef) {
    setSourceRef(source);
    setDraft(toDraft(source));
  }

  return [draft, setDraft];
}
