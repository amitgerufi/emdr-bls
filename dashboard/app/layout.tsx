import type { Metadata, Viewport } from "next";
import { Heebo, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import "./globals.css";

// Heebo — clean Hebrew + Latin sans (Roboto-derived). Both scripts are needed
// since the app's language toggle can switch to Hebrew at runtime. This stays
// the body font for ALL translatable text so Hebrew never falls back.
const heebo = Heebo({
  variable: "--font-sans",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

// Space Grotesk — Latin-only display face for the wordmark and the oversized
// "command deck" metric numerals. Never applied to translatable copy (no
// Hebrew glyphs); numerals + the fixed English wordmark only.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

// JetBrains Mono — Latin-only telemetry voice for uppercase micro-labels
// (SETS, REPS, SPEED, viewport readouts). Instrument/precision feel, RTL-safe.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EMDR BLS — Therapist Dashboard",
  description:
    "Control platform for bilateral stimulation in VR EMDR therapy. No patient-identifying data is ever stored.",
};

// viewportFit: "cover" lets fixed header/footer read real safe-area-inset-*
// values on notch/home-indicator devices instead of getting 0.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${heebo.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster richColors position="top-center" />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
