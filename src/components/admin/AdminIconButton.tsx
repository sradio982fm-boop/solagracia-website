"use client";

import { ActionIcon, Tooltip } from "@mantine/core";

interface AdminIconButtonProps {
  icon: "edit" | "delete" | "more_vert" | "visibility" | "add";
  label: string;
  onClick?: () => void;
  color?: string;
  disabled?: boolean;
  /** Quiet list-row actions (default). Use "outline" for primary toolbars. */
  variant?: "subtle" | "outline" | "light";
  size?: "sm" | "md" | "lg";
}

const ICON_MAP = {
  edit: "edit",
  delete: "delete_outline",
  more_vert: "more_vert",
  visibility: "visibility",
  add: "add",
} as const;

const ICON_SIZE = {
  sm: 16,
  md: 18,
  lg: 20,
} as const;

export function AdminIconButton({
  icon,
  label,
  onClick,
  color = "dark",
  disabled,
  variant = "subtle",
  size = "md",
}: AdminIconButtonProps) {
  return (
    <Tooltip label={label} withArrow openDelay={400}>
      <ActionIcon
        variant={variant}
        color={color}
        onClick={onClick}
        aria-label={label}
        disabled={disabled}
        size={size}
        radius="md"
      >
        <i
          className="material-icons"
          style={{ fontSize: ICON_SIZE[size], lineHeight: 1 }}
          aria-hidden
        >
          {ICON_MAP[icon]}
        </i>
      </ActionIcon>
    </Tooltip>
  );
}
