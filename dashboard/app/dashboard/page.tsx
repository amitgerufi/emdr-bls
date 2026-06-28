"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brand } from "@/components/brand";
import { FullScreenLoader } from "@/components/full-screen-loader";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Guard: unauthenticated visitors bounce to login.
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return <FullScreenLoader />;

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 px-5 py-3 backdrop-blur">
        <Brand />
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleSignOut}>
          <LogOut className="size-4" aria-hidden />
          התנתקות
        </Button>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">
              שלום, {user.displayName ?? "מטפל/ת"} 👋
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              ההתחברות הושלמה בהצלחה. זהו שלד הדשבורד — לוח הבקרה המלא (מהירות,
              ערוצי גירוי, שזירות, טיימרים וקוד PIN לחדר) ייבנה בשלב הבא.
            </p>
            <p className="text-xs">מחובר/ת כ־{user.email}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
