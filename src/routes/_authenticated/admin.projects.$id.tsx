import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { ListField, MediaField, TextField } from "@/components/admin/fields";
import { parseBlocks, type Block } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/projects/$id")({ component: ProjectEditor });

type Form = {
  title: string; slug: string; client: string; is_confidential: boolean; anonymous_label: string; summary: string;
  cover_url: string; cover_alt: string; thumbnail_url: string; categories: string[]; services: string[];
  role: string; industry: string; timeline: string; featured: boolean; status: string; seo_title: string; seo_description: string;
};

const EMPTY: Form = { title: "", slug: "", client: "", is_confidential: false, anonymous_label: "", summary: "", cover_url: "", cover_alt: "", thumbnail_url: "", categories: [], services: [], role: "", industry: "", timeline: "", featured: false, status: "draft", seo_title: "", seo_description: "" };

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function ProjectEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [f, setF] = useState<Form>(EMPTY);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isNew) return;
    supabase.from("projects").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) {
        const o = Object.fromEntries(Object.keys(EMPTY).map((k) => [k, (data as Record<string, unknown>)[k] ?? (EMPTY as Record<string, unknown>)[k]])) as Form;
        setF(o);
        setBlocks(parseBlocks(data.blocks));
      }
      setLoading(false);
    });
  }, [id, isNew]);

  const up = <K extends keyof Form>(k: K, v: Form[K]) => { setF((p) => ({ ...p, [k]: v })); setDirty(true); };

  async function save(status?: string) {
    if (!f.title.trim()) return void toast.error("Add a title");
    const slug = slugify(f.slug || f.title);
    if (!slug) return void toast.error("Add a valid slug");
    setSaving(true);
    const row = {
      ...f, slug, status: status ?? f.status,
      client: f.client || null, anonymous_label: f.anonymous_label || null, summary: f.summary || null,
      cover_url: f.cover_url || null, cover_alt: f.cover_alt || null, thumbnail_url: f.thumbnail_url || null,
      role: f.role || null, industry: f.industry || null, timeline: f.timeline || null,
      seo_title: f.seo_title || null, seo_description: f.seo_description || null,
      blocks: blocks as unknown as never,
    };
    const res = isNew ? await supabase.from("projects").insert(row).select("id").single() : await supabase.from("projects").update(row).eq("id", id).select("id").single();
    setSaving(false);
    if (res.error) return void toast.error(res.error.message.includes("duplicate") ? "That slug is already used" : "Couldn't save");
    setF((p) => ({ ...p, slug, status: row.status }));
    setDirty(false);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
    if (isNew) navigate({ to: "/admin/projects/$id", params: { id: res.data.id }, replace: true });
  }

  async function del() {
    if (!confirm("Delete this project permanently? This can't be undone.")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return void toast.error("Couldn't delete");
    qc.invalidateQueries({ queryKey: ["admin-projects"] });
    navigate({ to: "/admin/projects" });
  }

  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div className="max-w-4xl">
      <div className="sticky top-0 z-10 -mx-5 mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/95 px-5 py-4 backdrop-blur md:-mx-10 md:px-10">
        <div>
          <Link to="/admin/projects" className="text-sm text-muted-foreground">← Projects</Link>
          <h1 className="text-2xl font-semibold">{f.title || "New project"}</h1>
          <p className="label-mono text-muted-foreground">{f.status}{dirty ? " · unsaved changes" : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {f.status === "published" && !isNew && <Button asChild variant="outline" size="sm"><a href={`/work/${f.slug}`} target="_blank">View live</a></Button>}
          <Button variant="outline" size="sm" disabled={saving} onClick={() => save()}>{saving && <Loader2 className="animate-spin" />}Save</Button>
          {f.status !== "published" ? (
            <Button variant="signal" size="sm" disabled={saving} onClick={() => save("published")}>Publish</Button>
          ) : (
            <Button variant="outline" size="sm" disabled={saving} onClick={() => save("draft")}>Unpublish</Button>
          )}
        </div>
      </div>

      <section className="space-y-4 border border-border bg-background p-6">
        <h2 className="font-semibold">Basics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Title *" value={f.title} onChange={(v) => up("title", v)} />
          <TextField label="Slug (URL)" hint={`/work/${slugify(f.slug || f.title) || "…"}`} value={f.slug} onChange={(v) => up("slug", v)} />
          <TextField label="Client / brand" value={f.client} onChange={(v) => up("client", v)} />
          <TextField label="Industry" value={f.industry} onChange={(v) => up("industry", v)} />
          <TextField label="Our role" value={f.role} onChange={(v) => up("role", v)} />
          <TextField label="Timeline (if documented)" value={f.timeline} onChange={(v) => up("timeline", v)} />
          <ListField label="Categories" hint="Used for Work filters, e.g. Brand identity, Product design" value={f.categories} onChange={(v) => up("categories", v)} />
          <ListField label="Services provided" value={f.services} onChange={(v) => up("services", v)} />
        </div>
        <TextField label="Summary" multiline rows={3} value={f.summary} onChange={(v) => up("summary", v)} />
        <div className="flex flex-wrap gap-8 pt-2">
          <div className="flex items-center gap-2"><Switch id="feat" checked={f.featured} onCheckedChange={(v) => up("featured", v)} /><Label htmlFor="feat">Featured on home</Label></div>
          <div className="flex items-center gap-2"><Switch id="conf" checked={f.is_confidential} onCheckedChange={(v) => up("is_confidential", v)} /><Label htmlFor="conf">Confidential — hide client name</Label></div>
        </div>
        {f.is_confidential && <TextField label="Anonymous label" hint='e.g. "A fintech scale-up"' value={f.anonymous_label} onChange={(v) => up("anonymous_label", v)} />}
      </section>

      <section className="mt-6 space-y-4 border border-border bg-background p-6">
        <h2 className="font-semibold">Media</h2>
        <MediaField label="Cover image" url={f.cover_url} alt={f.cover_alt} onChange={(v) => up("cover_url", v)} onAltChange={(v) => up("cover_alt", v)} />
        <MediaField label="Thumbnail (optional, used in grids)" url={f.thumbnail_url} onChange={(v) => up("thumbnail_url", v)} />
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="font-semibold">Case study content</h2>
        <p className="text-sm text-muted-foreground">Build the story from blocks — challenge, approach, decisions, solution. Only include outcomes you can verify.</p>
        <BlockEditor blocks={blocks} onChange={(b) => { setBlocks(b); setDirty(true); }} />
      </section>

      <section className="mt-6 space-y-4 border border-border bg-background p-6">
        <h2 className="font-semibold">SEO</h2>
        <TextField label="SEO title" value={f.seo_title} onChange={(v) => up("seo_title", v)} />
        <TextField label="SEO description" multiline rows={2} value={f.seo_description} onChange={(v) => up("seo_description", v)} />
      </section>

      {!isNew && (
        <div className="mt-10 flex gap-3 border-t border-border pt-6">
          <Button variant="outline" onClick={() => save("archived")}>Archive</Button>
          <Button variant="destructive" onClick={del}>Delete</Button>
        </div>
      )}
    </div>
  );
}
