import { useRef, useState, type ReactNode } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { uploadMedia } from "@/lib/media";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string | undefined }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({ label, value, onChange, hint, multiline, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; hint?: string | undefined; multiline?: boolean | undefined; rows?: number | undefined }) {
  return (
    <Field label={label} hint={hint}>
      {multiline ? (
        <Textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

export function ListField({ label, value, onChange, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; hint?: string | undefined }) {
  return (
    <TextField
      label={label}
      hint={hint ?? "Separate with commas"}
      value={value.join(", ")}
      onChange={(v) => onChange(v.split(",").map((s) => s.trim()).filter(Boolean))}
    />
  );
}

export function MediaField({ label, url, onChange, alt, onAltChange }: { label: string; url: string; onChange: (u: string) => void; alt?: string | undefined; onAltChange?: ((a: string) => void) | undefined }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const isVideo = /\.(mp4|webm)(\?|$)/i.test(url);
  return (
    <Field label={label}>
      <div className="flex gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden border border-border bg-muted">
          {url && (isVideo ? <video src={url} className="h-full w-full object-cover" /> : <img src={url} alt="" className="h-full w-full object-cover" />)}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => ref.current?.click()}>
              {busy ? <Loader2 className="animate-spin" /> : <Upload />} Upload
            </Button>
            {url && (
              <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}><X /> Remove</Button>
            )}
          </div>
          <Input placeholder="…or paste an image URL" value={url} onChange={(e) => onChange(e.target.value)} />
          {onAltChange && <Input placeholder="Alt text (describe the image)" value={alt ?? ""} onChange={(e) => onAltChange(e.target.value)} />}
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*,video/mp4,video/webm"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          try {
            onChange(await uploadMedia(f));
            toast.success("Uploaded");
          } catch (err) {
            toast.error((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
    </Field>
  );
}
