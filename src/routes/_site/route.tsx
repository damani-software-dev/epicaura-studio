import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getSettings } from "@/lib/content.functions";

export const Route = createFileRoute("/_site")({
  loader: async () => ({ settings: await getSettings().catch(() => null) }),
  staleTime: 60_000,
  component: SiteLayout,
});

function SiteLayout() {
  const { settings } = Route.useLoaderData();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-signal focus:px-4 focus:py-2">
        Skip to content
      </a>
      <SiteHeader logoUrl={settings?.logo_url} cta={settings?.cta_text || "Start a project"} />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
