type ChangeLike = {
  currentTarget: { value: string; checked?: boolean } | null;
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

/** Safe checked flag from Mantine Switch events (`currentTarget` can be null). */
export function changeChecked(e: ChangeLike): boolean {
  const fromCurrent = e.currentTarget?.checked;
  if (typeof fromCurrent === "boolean") return fromCurrent;
  const target = e.target;
  if (
    target &&
    typeof target === "object" &&
    "checked" in target &&
    typeof (target as { checked: unknown }).checked === "boolean"
  ) {
    return (target as { checked: boolean }).checked;
  }
  return false;
}
