import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Wordmark({ logoUrl, className }: { logoUrl?: string | null | undefined; className?: string | undefined }) {
  return (
    <Link to="/" aria-label="EpicAura Studio — home" className={cn("inline-flex items-center", className)}>
      {logoUrl ? (
        <img src={logoUrl} alt="EpicAura Studio" className="h-7 w-auto" />
      ) : (
        <span className="font-display text-xl font-semibold tracking-tight">
          EpicAura<span className="text-signal">.</span>
          <span className="ml-1.5 label-mono align-middle text-muted-foreground">Studio</span>
        </span>
      )}
    </Link>
  );
}
