"use client";

import { MantineProvider, createTheme, rem } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./mantine-overrides.css";
import {
  ADMIN_BORDER,
  ADMIN_COLOR_SCALE,
  ADMIN_INK,
  ADMIN_PAGE_BG,
  ADMIN_SURFACE,
  ADMIN_TEAL,
} from "./ui";

const theme = createTheme({
  primaryColor: "sg",
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
    sg: [...ADMIN_COLOR_SCALE],
    // Remap legacy `color="dark"` usages to the same green/teal family
    dark: [...ADMIN_COLOR_SCALE],
  },
  primaryShade: { light: 5, dark: 5 },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
        color: "sg",
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
        color: "sg",
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
        color: "sg",
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
        color: "sg",
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
        color: "sg",
      },
    },
    ThemeIcon: {
      defaultProps: {
        color: "sg",
      },
    },
    Loader: {
      defaultProps: {
        color: "sg",
      },
    },
    Checkbox: {
      defaultProps: {
        color: "sg",
      },
    },
    Switch: {
      defaultProps: {
        color: "sg",
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
        header: {
          background: ADMIN_SURFACE,
          borderColor: ADMIN_BORDER,
        },
        navbar: {
          background: ADMIN_SURFACE,
          borderColor: ADMIN_BORDER,
        },
      },
    },
    Anchor: {
      defaultProps: {
        c: ADMIN_TEAL,
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
