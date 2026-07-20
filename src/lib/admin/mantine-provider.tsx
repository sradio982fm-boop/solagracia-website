"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

const theme = createTheme({
  primaryColor: "dark",
  defaultRadius: "md",
  fontFamily: "inherit",
  black: "#0a0a0a",
  white: "#ffffff",
  colors: {
    dark: [
      "#f5f5f5",
      "#e5e5e5",
      "#d4d4d4",
      "#a3a3a3",
      "#737373",
      "#525252",
      "#404040",
      "#262626",
      "#171717",
      "#0a0a0a",
    ],
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
