import { cn } from "@/lib/utils";

interface CharCounterProps {
  current: number;
  max: number;
}

export function CharCounter({ current, max }: CharCounterProps) {
  const isOver = current > max;
  const isNear = current > max * 0.9;

  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        isOver
          ? "text-red-500"
          : isNear
            ? "text-amber-500"
            : "text-muted-foreground",
      )}
    >
      {current}/{max}
    </span>
  );
}
