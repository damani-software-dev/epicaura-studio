import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/enquiries")({ component: Enquiries });

const STATUSES = ["new", "reviewed", "archived"] as const;

function Enquiries() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("new");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-enquiries", filter],
    queryFn: async () => (await supabase.from("enquiries").select("*").eq("status", filter).order("created_at", { ascending: false })).data ?? [],
  });
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
    if (error) return void toast.error("Couldn't update");
    qc.invalidateQueries({ queryKey: ["admin-enquiries"] });
  }
  async function del(id: string) {
    if (!confirm("Delete this enquiry permanently?")) return;
    await supabase.from("enquiries").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-enquiries"] });
  }
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold">Enquiries</h1>
      <div className="mt-6 flex gap-2">
        {STATUSES.map((s) => <Button key={s} size="sm" variant={s === filter ? "ink" : "outline"} className="capitalize" onClick={() => setFilter(s)}>{s}</Button>)}
      </div>
      {isLoading && <Loader2 className="mt-8 animate-spin" />}
      {data?.length === 0 && <p className="mt-8 border border-dashed border-border bg-background p-10 text-center text-muted-foreground">No {filter} enquiries.</p>}
      <div className="mt-6 space-y-4">
        {data?.map((e) => (
          <article key={e.id} className="border border-border bg-background p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{e.name} {e.company && <span className="font-normal text-muted-foreground">· {e.company}</span>}</h2>
                <a href={`mailto:${e.email}`} className="text-sm underline">{e.email}</a>
                {e.website && <p className="text-sm text-muted-foreground">{e.website}</p>}
              </div>
              <time className="label-mono text-muted-foreground">{new Date(e.created_at).toLocaleString()}</time>
            </div>
            <p className="mt-4 font-medium">{e.need}</p>
            {e.context && <p className="mt-2 whitespace-pre-line text-muted-foreground">{e.context}</p>}
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {e.services.length > 0 && <div><dt className="inline text-muted-foreground">Services: </dt><dd className="inline">{e.services.join(", ")}</dd></div>}
              {e.engagement && <div><dt className="inline text-muted-foreground">Engagement: </dt><dd className="inline">{e.engagement}</dd></div>}
              {e.budget && <div><dt className="inline text-muted-foreground">Budget: </dt><dd className="inline">{e.budget}</dd></div>}
              {e.timeline && <div><dt className="inline text-muted-foreground">Timeline: </dt><dd className="inline">{e.timeline}</dd></div>}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              {STATUSES.filter((s) => s !== e.status).map((s) => <Button key={s} size="sm" variant="outline" className="capitalize" onClick={() => setStatus(e.id, s)}>Mark {s}</Button>)}
              <Button size="sm" variant="ghost" onClick={() => del(e.id)}>Delete</Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
