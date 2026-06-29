"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brand } from "@/components/brand";
import { GoogleIcon } from "@/components/google-icon";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { FullScreenLoader } from "@/components/full-screen-loader";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  // Already signed in → go straight to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading || user) return <FullScreenLoader />;

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
      router.replace("/dashboard");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      // Closing the popup is a normal user action — don't treat it as an error.
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return;
      }
      toast.error(t("signInFailedTitle"), {
        description: t("signInFailedDesc"),
      });
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-1 items-center justify-center overflow-hidden px-5 py-12">
      {/* Ambient aurora — same living backdrop as the deck. */}
      <div aria-hidden className="aurora pointer-events-none absolute inset-0 -z-10" />

      <div className="absolute top-5 end-5 flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <Card className="glass w-full max-w-md rounded-3xl shadow-elevated-lg">
        <CardContent className="flex flex-col items-center gap-8 px-8 py-10 text-center">
          <Brand />

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("welcome")}</h1>
            <p className="text-balance text-sm leading-relaxed text-muted-foreground">
              {t("loginSubtitle")}
            </p>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="h-12 w-full gap-3 rounded-xl border-border bg-card text-base font-semibold hover:bg-secondary"
            onClick={handleSignIn}
            disabled={signingIn}
          >
            {signingIn ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <GoogleIcon className="size-5" />
            )}
            {signingIn ? t("signingIn") : t("signInWithGoogle")}
          </Button>

          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-accent" aria-hidden />
            {t("noPatientData")}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
