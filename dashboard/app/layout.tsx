import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

// Heebo — clean, clinical Hebrew + Latin sans (Roboto-derived). Chosen over the
// design skill's Latin-only pairing because this app is Hebrew/RTL.
const heebo = Heebo({
  variable: "--font-sans",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EMDR BLS — דשבורד מטפל",
  description:
    "פלטפורמת בקרה לטיפול EMDR בגירוי בילטרלי במציאות מדומה. ללא שמירת פרטים מזהים של מטופלים.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
