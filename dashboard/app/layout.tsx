import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import "./globals.css";

// Heebo — clean Hebrew + Latin sans (Roboto-derived). Both scripts are needed
// since the app's language toggle can switch to Hebrew at runtime.
const heebo = Heebo({
  variable: "--font-sans",
  subsets: ["hebrew", "latin"],
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
      className={`${heebo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster richColors position="top-center" />
        </LanguageProvider>
      </body>
    </html>
  );
}
