export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-xl border border-border/70 bg-secondary/70 px-1 py-2 text-center shadow-[inset_0_1px_2px_rgba(16,42,54,0.04)]">
      <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
      <div className="text-base font-extrabold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
