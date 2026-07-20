"use client";

import { MantineProvider, createTheme, rem } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import {
  ADMIN_BORDER,
  ADMIN_FOCUS_RING,
  ADMIN_INK,
  ADMIN_MUTED_BG,
  ADMIN_PAGE_BG,
  ADMIN_SURFACE,
} from "./ui";

const theme = createTheme({
  primaryColor: "dark",
  defaultRadius: "md",
  fontFamily: "inherit",
  black: ADMIN_INK,
  white: ADMIN_SURFACE,
  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(12),
    lg: rem(16),
    xl: rem(24),
  },
  colors: {
    dark: [
      ADMIN_MUTED_BG,
      "#e8e6e2",
      "#d0cec9",
      "#a8a59e",
      "#7a7771",
      "#5c5a56",
      "#45433f",
      "#2f2e2b",
      "#262523",
      ADMIN_INK,
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          fontWeight: 600,
          transition:
            "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
        },
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: "md",
      },
      styles: {
        root: {
          transition: "background-color 150ms ease, border-color 150ms ease",
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
      },
    },
    Modal: {
      defaultProps: {
        radius: "md",
        centered: true,
      },
      styles: {
        content: {
          background: ADMIN_SURFACE,
        },
        header: {
          borderBottom: `1px solid ${ADMIN_BORDER}`,
          marginBottom: rem(4),
          paddingBottom: rem(12),
          background: ADMIN_SURFACE,
        },
        title: {
          fontWeight: 700,
          color: ADMIN_INK,
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          background: ADMIN_SURFACE,
          borderColor: ADMIN_BORDER,
          transition: "border-color 150ms ease, box-shadow 150ms ease",
          "&:focus": {
            borderColor: ADMIN_INK,
            boxShadow: ADMIN_FOCUS_RING,
          },
        },
        label: {
          fontWeight: 600,
          marginBottom: rem(4),
          color: ADMIN_INK,
        },
      },
    },
    PasswordInput: {
      styles: {
        input: {
          background: ADMIN_SURFACE,
          borderColor: ADMIN_BORDER,
          transition: "border-color 150ms ease, box-shadow 150ms ease",
          "&:focus-within": {
            borderColor: ADMIN_INK,
            boxShadow: ADMIN_FOCUS_RING,
          },
        },
        label: {
          fontWeight: 600,
          marginBottom: rem(4),
          color: ADMIN_INK,
        },
      },
    },
    Textarea: {
      styles: {
        input: {
          background: ADMIN_SURFACE,
          borderColor: ADMIN_BORDER,
          transition: "border-color 150ms ease, box-shadow 150ms ease",
          "&:focus": {
            borderColor: ADMIN_INK,
            boxShadow: ADMIN_FOCUS_RING,
          },
        },
        label: {
          fontWeight: 600,
          marginBottom: rem(4),
          color: ADMIN_INK,
        },
      },
    },
    Select: {
      styles: {
        label: {
          fontWeight: 600,
          marginBottom: rem(4),
          color: ADMIN_INK,
        },
        input: {
          background: ADMIN_SURFACE,
          borderColor: ADMIN_BORDER,
        },
      },
    },
    NavLink: {
      defaultProps: {
        variant: "light",
        color: "dark",
      },
      styles: {
        root: {
          borderRadius: "var(--mantine-radius-md)",
          fontWeight: 500,
          minHeight: 44,
          transition: "background-color 150ms ease, color 150ms ease",
        },
      },
    },
    Tabs: {
      defaultProps: {
        color: "dark",
      },
      styles: {
        tab: {
          fontWeight: 600,
          transition: "color 150ms ease, border-color 150ms ease",
        },
        list: {
          borderColor: ADMIN_BORDER,
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
      },
    },
    Divider: {
      defaultProps: {
        color: ADMIN_BORDER,
      },
    },
    AppShell: {
      styles: {
        main: {
          background: ADMIN_PAGE_BG,
        },
      },
    },
  },
});

export function AdminMantineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      {children}
    </MantineProvider>
  );
}
