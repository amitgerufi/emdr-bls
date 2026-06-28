"use client";

import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";

interface ChannelToggleProps {
  icon: ReactNode;
  name: string;
  on: boolean;
  onToggle: () => void;
  children?: ReactNode;
}

export function ChannelToggle({ icon, name, on, onToggle, children }: ChannelToggleProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-[14.5px] font-semibold">
          <span className="grid size-8 flex-none place-items-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
          {name}
        </div>
        <Switch checked={on} onCheckedChange={onToggle} />
      </div>
      {children && (
        <div className={on ? "mt-3.5 space-y-4" : "mt-3.5 space-y-4 pointer-events-none opacity-35"}>
          {children}
        </div>
      )}
    </div>
  );
}
