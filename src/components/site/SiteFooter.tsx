import { Link } from "@tanstack/react-router";
import type { Settings } from "@/lib/content";
import { socialLinks } from "@/lib/content";

export function SiteFooter({ settings }: { settings: Settings | null }) {
  const email = settings?.contact_email;
  const socials = socialLinks(settings?.social_links);
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="container-edit grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="font-display text-5xl font-semibold tracking-tight md:text-7xl">
            EpicAura<span className="text-signal">.</span>
          </p>
          {settings?.footer_text && (
            <p className="mt-5 max-w-sm text-ink-muted">{settings.footer_text}</p>
          )}
        </div>
        <nav aria-label="Footer" className="md:col-span-3">
          <p className="label-mono text-ink-muted">Studio</p>
          <ul className="mt-4 space-y-2">
            {(["/work", "/services", "/about", "/contact"] as const).map((to) => (
              <li key={to}>
                <Link to={to} className="capitalize hover:text-signal transition-colors">
                  {to.slice(1)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="md:col-span-3">
          <p className="label-mono text-ink-muted">Contact</p>
          {email && (
            <a href={`mailto:${email}`} className="mt-4 block hover:text-signal transition-colors break-all">
              {email}
            </a>
          )}
          {socials.length > 0 && (
            <ul className="mt-4 space-y-2">
              {socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-signal transition-colors">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="container-edit flex justify-between border-t border-ink-border py-6 label-mono text-ink-muted">
        <span>© {new Date().getFullYear()} EpicAura Studio</span>
        <span>Brand · Product · Digital</span>
      </div>
    </footer>
  );
}
