import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "./Wordmark";

const NAV = [
  { to: "/work", label: "Work", n: "01" },
  { to: "/services", label: "Services", n: "02" },
  { to: "/about", label: "About", n: "03" },
  { to: "/contact", label: "Contact", n: "04" },
] as const;

export function SiteHeader({ logoUrl, cta }: { logoUrl?: string | null | undefined; cta: string }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container-edit flex h-16 items-center justify-between gap-6">
        <Wordmark logoUrl={logoUrl} />
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="group relative py-1 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
            >
              {({ isActive }) => (
                <>
                  {n.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-signal transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                  />
                </>
              )}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button asChild variant="ink" size="sm" className="h-9 px-4">
            <Link to="/contact">
              {cta} <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <button
          type="button"
          className="md:hidden -mr-2 p-2"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 bg-ink text-ink-foreground md:hidden">
          <nav aria-label="Mobile" className="container-edit flex flex-col pt-8">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="flex items-baseline gap-4 border-b border-ink-border py-5 font-display text-4xl font-semibold tracking-tight data-[status=active]:text-signal"
              >
                <span className="label-mono text-ink-muted">{n.n}</span>
                {n.label}
              </Link>
            ))}
            <Button asChild variant="signal" size="xl" className="mt-10">
              <Link to="/contact">{cta}</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
