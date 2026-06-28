import type { ComponentType } from "react";

interface SectionTriggerProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
}

export function SectionTrigger({ icon: Icon, label }: SectionTriggerProps) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-8 flex-none place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      {label}
    </span>
  );
}
