type ChangeLike = {
  currentTarget: { value: string } | null;
  target: EventTarget | null;
};

/** Safe value from Mantine/React change events (`currentTarget` can be null). */
export function changeValue(e: ChangeLike): string {
  const fromCurrent = e.currentTarget?.value;
  if (typeof fromCurrent === "string") return fromCurrent;
  const target = e.target;
  if (
    target &&
    typeof target === "object" &&
    "value" in target &&
    typeof (target as { value: unknown }).value === "string"
  ) {
    return (target as { value: string }).value;
  }
  return "";
}
