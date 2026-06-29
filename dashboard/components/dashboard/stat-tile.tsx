export function StatTile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-xl border border-border/70 bg-secondary/70 px-1.5 py-2.5 text-center shadow-[inset_0_1px_2px_rgba(6,14,22,0.06)]">
      {/* Thin accent rail — puts the otherwise-unused chart tokens to work. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: accent ?? "var(--chart-1)", opacity: 0.7 }}
      />
      {/* Label stays Heebo (translatable → Hebrew-safe); the display/mono faces
          are reserved for numerals and fixed-English chrome only. */}
      <div className="text-[9.5px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{label}</div>
      <div className="metric mt-1 text-lg text-foreground">{value}</div>
    </div>
  );
}
