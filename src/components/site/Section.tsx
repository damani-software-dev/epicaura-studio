import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Eyebrow({ n, children, className }: { n?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn("label-mono flex items-center gap-3 text-muted-foreground", className)}>
      {n && <span className="text-signal">{n}</span>}
      <span className="h-px w-8 bg-current opacity-40" />
      {children}
    </p>
  );
}

export function Lines({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split("\n").map((l, i) => (
        <span key={i} className="block">
          {l}
        </span>
      ))}
    </span>
  );
}
