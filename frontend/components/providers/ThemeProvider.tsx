"use client";

import {
  ThemeProvider as NextThemesProvider,
} from "next-themes";

import SavedTheme from "./SavedTheme";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <SavedTheme />

      {children}
    </NextThemesProvider>
  );
}