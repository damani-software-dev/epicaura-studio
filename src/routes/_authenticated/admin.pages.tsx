import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MediaField, TextField } from "@/components/admin/fields";
import { Plus, Trash2 } from "lucide-react";
import { PAGE_DEFAULTS, pageCopy, parseTeam, parseTestimonials, type PageKey } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/pages")({ component: PagesAdmin });

const label = (k: string) => k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

function PagesAdmin() {
  const [slug, setSlug] = useState<PageKey>("home");
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold">Pages</h1>
      <div className="mt-6 flex gap-2">
        {(Object.keys(PAGE_DEFAULTS) as PageKey[]).map((k) => (
          <Button key={k} size="sm" variant={k === slug ? "ink" : "outline"} onClick={() => setSlug(k)} className="capitalize">{k}</Button>
        ))}
      </div>
      <PageForm key={slug} slug={slug} />
    </div>
  );
}

function PageForm({ slug }: { slug: PageKey }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-page", slug],
    queryFn: async () => (await supabase.from("pages").select("*").eq("slug", slug).maybeSingle()).data,
  });
  const [c, setC] = useState<Record<string, string>>({});
  const [seo, setSeo] = useState({ seo_title: "", seo_description: "" });
  const [saving, setSaving] = useState(false);
  const listKey = slug === "about" ? "team" : "testimonials";
  const [items, setItems] = useState<Record<string, string>[]>([]);
  useEffect(() => {
    if (isLoading) return;
    setC(pageCopy(slug, data?.content) as Record<string, string>);
    setItems(slug === "about" ? parseTeam(data?.content) : parseTestimonials(data?.content));
    setSeo({ seo_title: data?.seo_title ?? "", seo_description: data?.seo_description ?? "" });
  }, [data, isLoading, slug]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("pages").upsert({ slug, title: label(slug), content: { ...c, [listKey]: items }, seo_title: seo.seo_title || null, seo_description: seo.seo_description || null }, { onConflict: "slug" });
    setSaving(false);
    error ? toast.error("Couldn't save") : toast.success("Saved — live on the site");
  }

  if (isLoading) return <Loader2 className="mt-8 animate-spin" />;
  return (
    <div className="mt-6 space-y-4 border border-border bg-background p-6">
      {Object.keys(PAGE_DEFAULTS[slug]).map((k) => (
        <TextField key={k} label={label(k)} multiline={k.endsWith("body") || k === "hero_title"} rows={k === "hero_title" ? 3 : 4} hint={k === "hero_title" ? "Each line break becomes a new line in the headline" : undefined} value={c[k] ?? ""} onChange={(v) => setC((p) => ({ ...p, [k]: v }))} />
      ))}
      <ListEditor kind={listKey} items={items} setItems={setItems} />
      <div className="border-t border-border pt-4 space-y-4">
        <TextField label="SEO title" value={seo.seo_title} onChange={(v) => setSeo((p) => ({ ...p, seo_title: v }))} />
        <TextField label="SEO description" multiline rows={2} value={seo.seo_description} onChange={(v) => setSeo((p) => ({ ...p, seo_description: v }))} />
      </div>
      <Button variant="ink" disabled={saving} onClick={save}>{saving && <Loader2 className="animate-spin" />}Save page</Button>
    </div>
  );
}

const LIST_FIELDS = {
  team: { title: "Team members", add: "Add team member", fields: [["name", "Name"], ["role", "Role"], ["bio", "Short bio"]], blank: { name: "", role: "", photo_url: "", bio: "" } },
  testimonials: { title: "Testimonials", add: "Add testimonial", fields: [["quote", "Quote (approved by the client)"], ["name", "Name"], ["role", "Role"], ["company", "Company"]], blank: { quote: "", name: "", role: "", company: "", photo_url: "" } },
} as const;

function ListEditor({ kind, items, setItems }: { kind: "team" | "testimonials"; items: Record<string, string>[]; setItems: (f: (p: Record<string, string>[]) => Record<string, string>[]) => void }) {
  const cfg = LIST_FIELDS[kind];
  const set = (i: number, k: string, v: string) => setItems((p) => p.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  return (
    <div className="border-t border-border pt-4 space-y-4">
      <h2 className="text-xl font-semibold">{cfg.title}</h2>
      <p className="text-sm text-muted-foreground">This section appears on the site once you add at least one.</p>
      {items.map((it, i) => (
        <div key={i} className="space-y-3 border border-border p-4">
          {cfg.fields.map(([k, l]) => (
            <TextField key={k} label={l} multiline={k === "quote" || k === "bio"} rows={3} value={it[k] ?? ""} onChange={(v) => set(i, k, v)} />
          ))}
          <MediaField label="Photo (optional)" url={it["photo_url"] ?? ""} onChange={(u) => set(i, "photo_url", u)} />
          <Button size="sm" variant="ghost" onClick={() => setItems((p) => p.filter((_, j) => j !== i))}><Trash2 /> Remove</Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => setItems((p) => [...p, { ...cfg.blank }])}><Plus /> {cfg.add}</Button>
    </div>
  );
}
