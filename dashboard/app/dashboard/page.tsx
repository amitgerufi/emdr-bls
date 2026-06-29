"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, MessageSquareText, Move, Palette, SlidersHorizontal, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { ensureRoom } from "@/lib/room";
import { useSessionPanel } from "@/lib/use-session-panel";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Brand } from "@/components/brand";
import { FullScreenLoader } from "@/components/full-screen-loader";
import { ConnectionBadge } from "@/components/dashboard/connection-badge";
import { PinBadge } from "@/components/dashboard/pin-badge";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { SectionTrigger } from "@/components/dashboard/section-trigger";
import { LivePreview } from "@/components/dashboard/live-preview";
import { SessionHero } from "@/components/dashboard/session-hero";
import { MotionSection } from "@/components/dashboard/motion-section";
import { ChannelsSection } from "@/components/dashboard/channels-section";
import { InterweaveSection } from "@/components/dashboard/interweave-section";
import { AmbianceSection } from "@/components/dashboard/ambiance-section";
import { PresetsSection } from "@/components/dashboard/presets-section";
import { ActionBar } from "@/components/dashboard/action-bar";

const SECTION_CLASS =
  "glass rounded-2xl px-4 transition-all hover:-translate-y-0.5 hover:shadow-elevated-lg lg:self-start";
const TRIGGER_CLASS = "text-[14px] font-bold hover:no-underline";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);

  // Guard: unauthenticated visitors bounce to login.
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  // Resolve (or create, on first login) this therapist's permanent room + PIN.
  useEffect(() => {
    if (!user) return;
    ensureRoom(user.uid)
      .then(({ roomId, pin }) => {
        setRoomId(roomId);
        setPin(pin);
      })
      .catch((err) => {
        console.error(err);
        toast.error(t("roomSetupFailed"));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `t` intentionally excluded: re-running ensureRoom on every language toggle would be wasteful, not just a lint nit
  }, [user]);

  const panel = useSessionPanel(roomId);

  if (loading || !user) return <FullScreenLoader />;

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col pb-28">
      {/* Ambient aurora — slow-drifting mesh that gives the deck its "live
          screen" depth and fills the wide-viewport margins with brand light. */}
      <div aria-hidden className="aurora pointer-events-none fixed inset-0 -z-10" />

      <header className="glass sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 rounded-none border-x-0 border-t-0 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:px-6">
        <Brand compact />
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <ConnectionBadge connected={panel.connected} />
          {pin && <PinBadge pin={pin} />}
          <ThemeToggle />
          <LanguageToggle />
          <span className="h-5 w-px bg-border" />
          <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={handleSignOut} aria-label={t("signOut")}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-3xl flex-1 grid-cols-1 gap-3.5 px-4 py-5 lg:max-w-6xl lg:grid-cols-[380px_1fr] lg:items-start lg:gap-5 lg:px-6">
        {!roomId ? (
          <RoomSkeleton label={t("settingUpRoom")} />
        ) : (
          <>
            {/* Left rail — the live monitor + session vitals, pinned on desktop
                so they stay in view while controls scroll on the right. */}
            <div className="flex flex-col gap-3.5 lg:sticky lg:top-[72px] lg:self-start">
              <LivePreview state={panel.state} iwText={panel.iwStatusText} />

              <SessionHero
                phase={panel.phase}
                sets={panel.sets}
                reps={panel.reps}
                setSecs={panel.setSecs}
                totalSecs={panel.totalSecs}
                speed={panel.state.speed}
                onNewSession={panel.newSession}
                onSpeedChange={(v) => panel.setField("speed", v)}
                onSpeedStep={(d) => panel.step("speed", d, 1, 9)}
              />
            </div>

            <Accordion
              type="multiple"
              defaultValue={["motion", "channels", "interweave", "ambiance", "presets"]}
              className="space-y-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-3 lg:space-y-0"
            >
              <AccordionItem value="motion" className={SECTION_CLASS}>
                <AccordionTrigger className={TRIGGER_CLASS}>
                  <SectionTrigger icon={Move} label={t("sectionMotion")} />
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <MotionSection
                    state={panel.state}
                    setField={panel.setField}
                    step={panel.step}
                    setPattern={panel.setPattern}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="channels" className={SECTION_CLASS}>
                <AccordionTrigger className={TRIGGER_CLASS}>
                  <SectionTrigger icon={SlidersHorizontal} label={t("sectionChannels")} />
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ChannelsSection
                    state={panel.state}
                    setField={panel.setField}
                    step={panel.step}
                    toggle={panel.toggle}
                    setColor={panel.setColor}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="interweave" className={SECTION_CLASS}>
                <AccordionTrigger className={TRIGGER_CLASS}>
                  <SectionTrigger icon={MessageSquareText} label={t("sectionInterweave")} />
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <InterweaveSection
                    iwStatusText={panel.iwStatusText}
                    onSend={panel.sendInterweave}
                    onHide={panel.hideInterweave}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ambiance" className={`${SECTION_CLASS} lg:col-span-2`}>
                <AccordionTrigger className={TRIGGER_CLASS}>
                  <SectionTrigger icon={Palette} label={t("sectionAmbiance")} />
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <AmbianceSection
                    env={panel.state.env}
                    music={panel.state.music}
                    musicVolume={panel.state.musicVolume}
                    setEnv={panel.setEnv}
                    setMusic={panel.setMusic}
                    setField={panel.setField}
                    step={panel.step}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="presets" className={SECTION_CLASS}>
                <AccordionTrigger className={TRIGGER_CLASS}>
                  <SectionTrigger icon={Star} label={t("sectionPresets")} />
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <PresetsSection
                    uid={user.uid}
                    currentSettings={panel.currentPresetSettings}
                    onApply={panel.applyPreset}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </main>

      {roomId && (
        <ActionBar
          running={panel.state.running}
          endSetDisabled={panel.endSetDisabled}
          onTogglePlay={panel.togglePlay}
          onEndSet={panel.endSet}
        />
      )}
    </div>
  );
}

/** Loading state shown while the therapist's room/PIN resolves. Mirrors the
 *  real layout's shape (rail + card grid) so the page settles instead of
 *  popping from a blank line to full content. */
function RoomSkeleton({ label }: { label: string }) {
  return (
    <div className="lg:col-span-2">
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[380px_1fr] lg:items-start lg:gap-5">
        <div className="flex flex-col gap-3.5">
          <div className="h-[128px] animate-pulse rounded-2xl bg-muted lg:h-[168px]" />
          <div className="h-[168px] animate-pulse rounded-3xl bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted lg:col-span-2" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-center gap-2.5 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
        {label}
      </div>
    </div>
  );
}
