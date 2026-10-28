import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/projects/")({ component: ProjectsAdmin });

function ProjectsAdmin() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id,title,slug,status,featured,sort_order,updated_at").order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function move(i: number, dir: -1 | 1) {
    if (!data) return;
    const list = [...data];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j]!, list[i]!];
    const res = await Promise.all(list.map((p, idx) => supabase.from("projects").update({ sort_order: idx }).eq("id", p.id)));
    if (res.some((r) => r.error)) toast.error("Couldn't reorder");
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <Button asChild variant="ink"><Link to="/admin/projects/$id" params={{ id: "new" }}>+ New project</Link></Button>
      </div>
      {isLoading && <Loader2 className="mt-10 animate-spin" />}
      {error && <p className="mt-6 text-destructive">Couldn't load projects.</p>}
      {data && data.length === 0 && (
        <div className="mt-10 border border-dashed border-border bg-background p-10 text-center text-muted-foreground">No projects yet. Create your first case study.</div>
      )}
      {data && data.length > 0 && (
        <ul className="mt-8 divide-y divide-border border border-border bg-background">
          {data.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3 p-4">
              <div className="flex flex-col">
                <button aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-20"><ArrowUp className="size-4" /></button>
                <button aria-label="Move down" onClick={() => move(i, 1)} disabled={i === data.length - 1} className="disabled:opacity-20"><ArrowDown className="size-4" /></button>
              </div>
              <Link to="/admin/projects/$id" params={{ id: p.id }} className="flex-1 font-medium hover:underline">{p.title}</Link>
              {p.featured && <span className="label-mono text-signal">Featured</span>}
              <span className={`label-mono px-2 py-1 ${p.status === "published" ? "bg-foreground text-background" : "bg-secondary"}`}>{p.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
