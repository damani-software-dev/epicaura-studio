import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaField, TextField } from "@/components/admin/fields";
import { socialLinks } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsAdmin });

function SettingsAdmin() {
  const [s, setS] = useState({ logo_url: "", contact_email: "", cta_text: "", footer_text: "", default_seo_title: "", default_seo_description: "", default_og_image: "" });
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) {
        setS({
          logo_url: data.logo_url ?? "", contact_email: data.contact_email ?? "", cta_text: data.cta_text,
          footer_text: data.footer_text ?? "", default_seo_title: data.default_seo_title ?? "",
          default_seo_description: data.default_seo_description ?? "", default_og_image: data.default_og_image ?? "",
        });
        setLinks(Array.isArray(data.social_links) ? (data.social_links as { label: string; url: string }[]) : []);
      }
      setLoading(false);
    });
  }, []);
  const up = (k: keyof typeof s) => (v: string) => setS((p) => ({ ...p, [k]: v }));
  async function save() {
    setSaving(true);
    const n = (v: string) => v || null;
    const { error } = await supabase.from("site_settings").upsert({
      id: 1, logo_url: n(s.logo_url), contact_email: n(s.contact_email), cta_text: s.cta_text || "Start a project",
      footer_text: n(s.footer_text), default_seo_title: n(s.default_seo_title), default_seo_description: n(s.default_seo_description),
      default_og_image: n(s.default_og_image), social_links: socialLinks(links),
    });
    setSaving(false);
    error ? toast.error("Couldn't save") : toast.success("Settings saved");
  }
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold">Site settings</h1>
      <section className="space-y-4 border border-border bg-background p-6">
        <MediaField label="Logo (leave empty to use the type wordmark)" url={s.logo_url} onChange={up("logo_url")} />
        <TextField label="Contact email" value={s.contact_email} onChange={up("contact_email")} />
        <TextField label="Header CTA text" value={s.cta_text} onChange={up("cta_text")} />
        <TextField label="Footer text" multiline rows={2} value={s.footer_text} onChange={up("footer_text")} />
      </section>
      <section className="space-y-3 border border-border bg-background p-6">
        <h2 className="font-semibold">Social links</h2>
        {links.map((l, i) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="Label (e.g. Instagram)" value={l.label} onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <Input placeholder="https://…" value={l.url} onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
            <Button size="icon" variant="ghost" aria-label="Remove link" onClick={() => setLinks(links.filter((_, j) => j !== i))}><Trash2 /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setLinks([...links, { label: "", url: "" }])}><Plus /> Add link</Button>
      </section>
      <section className="space-y-4 border border-border bg-background p-6">
        <h2 className="font-semibold">Default SEO</h2>
        <TextField label="Default title" value={s.default_seo_title} onChange={up("default_seo_title")} />
        <TextField label="Default description" multiline rows={2} value={s.default_seo_description} onChange={up("default_seo_description")} />
        <MediaField label="Default sharing image" url={s.default_og_image} onChange={up("default_og_image")} />
      </section>
      <Button variant="ink" disabled={saving} onClick={save}>{saving && <Loader2 className="animate-spin" />}Save settings</Button>
    </div>
  );
}
