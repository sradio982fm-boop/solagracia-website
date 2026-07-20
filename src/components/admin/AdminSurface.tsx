"use client";

import { Paper } from "@mantine/core";
import {
  adminInteractiveSurfaceStyle,
  adminSurfaceStyle,
  ADMIN_HOVER_BG,
  ADMIN_SURFACE,
} from "@/lib/admin/ui";
import type {
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from "react";

interface AdminSurfaceProps {
  children: ReactNode;
  interactive?: boolean;
  style?: CSSProperties;
  p?: string | number;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function AdminSurface({
  children,
  interactive = false,
  style,
  p,
  className,
  onClick,
}: AdminSurfaceProps) {
  return (
    <Paper
      withBorder
      radius="md"
      p={p}
      className={className}
      onClick={onClick}
      style={
        interactive
          ? adminInteractiveSurfaceStyle(style)
          : adminSurfaceStyle(style)
      }
      onMouseEnter={
        interactive
          ? (e) => {
              e.currentTarget.style.background = ADMIN_HOVER_BG;
            }
          : undefined
      }
      onMouseLeave={
        interactive
          ? (e) => {
              e.currentTarget.style.background = ADMIN_SURFACE;
            }
          : undefined
      }
    >
      {children}
    </Paper>
  );
}
