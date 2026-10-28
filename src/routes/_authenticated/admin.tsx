import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Studio editor — EpicAura" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", context.user.id).eq("role", "admin").maybeSingle();
    return { isAdmin: !!data };
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/pages", label: "Pages" },
  { to: "/admin/enquiries", label: "Enquiries" },
  { to: "/admin/settings", label: "Settings" },
] as const;

function AdminLayout() {
  const { isAdmin, user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">No editor access</h1>
          <p className="mt-3 text-muted-foreground">{user.email} isn't a studio administrator.</p>
          <Button variant="outline" className="mt-6" onClick={signOut}>Sign out</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-secondary md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-border bg-background md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-5">
          <Link to="/admin" className="font-display text-lg font-semibold">EpicAura<span className="text-signal">.</span> <span className="label-mono text-muted-foreground">CMS</span></Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }} className="whitespace-nowrap px-3 py-2 text-sm text-muted-foreground hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground data-[status=active]:font-medium">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden space-y-1 p-3 md:absolute md:bottom-0 md:block md:w-full">
          <a href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"><ExternalLink className="size-4" /> View site</a>
          <button onClick={signOut} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"><LogOut className="size-4" /> Sign out</button>
        </div>
      </aside>
      <main className="p-5 md:p-10">
        <Outlet />
        <button onClick={signOut} className="mt-10 text-sm text-muted-foreground underline md:hidden">Sign out</button>
      </main>
    </div>
  );
}
