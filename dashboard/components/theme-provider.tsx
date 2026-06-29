"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Client wrapper so the server-rendered root layout can mount next-themes.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
