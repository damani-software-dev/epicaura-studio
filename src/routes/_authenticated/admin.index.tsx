import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Overview });

function Overview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [p, pub, e] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);
      return { projects: p.count ?? 0, published: pub.count ?? 0, newEnquiries: e.count ?? 0 };
    },
  });
  const cards = [
    { k: "Projects", v: data?.projects, to: "/admin/projects" as const },
    { k: "Published", v: data?.published, to: "/admin/projects" as const },
    { k: "New enquiries", v: data?.newEnquiries, to: "/admin/enquiries" as const },
  ];
  return (
    <div>
      <h1 className="text-3xl font-semibold">Overview</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.k} to={c.to} className="border border-border bg-background p-6 hover:border-foreground">
            <p className="label-mono text-muted-foreground">{c.k}</p>
            <p className="mt-3 text-4xl font-semibold">{c.v ?? "–"}</p>
          </Link>
        ))}
      </div>
      <Link to="/admin/projects/$id" params={{ id: "new" }} className="mt-8 inline-block bg-foreground px-4 py-2 text-sm text-background">+ New project</Link>
    </div>
  );
}
