import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ListField, TextField } from "@/components/admin/fields";
import type { Database } from "@/integrations/supabase/types";

type Row = Database["public"]["Tables"]["services"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/services")({ component: ServicesAdmin });

function ServicesAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => (await supabase.from("services").select("*").order("sort_order")).data ?? [],
  });
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold">Services</h1>
      {isLoading && <Loader2 className="mt-8 animate-spin" />}
      <div className="mt-8 space-y-6">{data?.map((s) => <ServiceForm key={s.id} row={s} />)}</div>
    </div>
  );
}

function ServiceForm({ row }: { row: Row }) {
  const qc = useQueryClient();
  const [s, setS] = useState(row);
  const [saving, setSaving] = useState(false);
  const up = <K extends keyof Row>(k: K, v: Row[K]) => setS((p) => ({ ...p, [k]: v }));
  async function save() {
    setSaving(true);
    const { id, created_at: _c, updated_at: _u, ...rest } = s;
    const { error } = await supabase.from("services").update(rest).eq("id", id);
    setSaving(false);
    if (error) return void toast.error("Couldn't save");
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["admin-services"] });
  }
  return (
    <section className="space-y-4 border border-border bg-background p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold"><span className="text-signal">{s.number}</span> {s.title}</h2>
        <label className="flex items-center gap-2 text-sm"><Switch checked={s.status === "published"} onCheckedChange={(v) => up("status", v ? "published" : "draft")} /> Published</label>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_3fr]">
        <TextField label="Number" value={s.number ?? ""} onChange={(v) => up("number", v)} />
        <TextField label="Title" value={s.title} onChange={(v) => up("title", v)} />
      </div>
      <TextField label="Short description" multiline rows={2} value={s.short_description ?? ""} onChange={(v) => up("short_description", v)} />
      <TextField label="Problems it addresses" multiline rows={3} value={s.problems ?? ""} onChange={(v) => up("problems", v)} />
      <TextField label="Approach (detailed description)" multiline value={s.description ?? ""} onChange={(v) => up("description", v)} />
      <ListField label="Capabilities / deliverables" value={s.capabilities} onChange={(v) => up("capabilities", v)} />
      <Button variant="ink" disabled={saving} onClick={save}>{saving && <Loader2 className="animate-spin" />}Save</Button>
    </section>
  );
}
