import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True after hydration — avoids SSR/client markup mismatch. */
export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
