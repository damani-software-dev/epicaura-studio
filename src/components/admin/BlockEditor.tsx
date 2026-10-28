import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { BLOCK_LABELS, emptyBlock, type Block, type BlockType } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { MediaField, TextField } from "./fields";

type Img = { url: string; alt: string };

export function BlockEditor({ blocks, onChange }: { blocks: Block[]; onChange: (b: Block[]) => void }) {
  const set = (i: number, b: Block) => onChange(blocks.map((x, j) => (j === i ? b : x)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const n = [...blocks];
    [n[i], n[j]] = [n[j]!, n[i]!];
    onChange(n);
  };
  const remove = (i: number) => {
    if (confirm("Remove this block?")) onChange(blocks.filter((_, j) => j !== i));
  };

  return (
    <div className="space-y-4">
      {blocks.map((b, i) => (
        <div key={i} className="border border-border bg-background p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="label-mono">{String(i + 1).padStart(2, "0")} · {BLOCK_LABELS[b.type]}</span>
            <div className="flex gap-1">
              <Button type="button" size="icon" variant="ghost" aria-label="Move up" onClick={() => move(i, -1)}><ArrowUp /></Button>
              <Button type="button" size="icon" variant="ghost" aria-label="Move down" onClick={() => move(i, 1)}><ArrowDown /></Button>
              <Button type="button" size="icon" variant="ghost" aria-label="Remove" onClick={() => remove(i)}><Trash2 /></Button>
            </div>
          </div>
          <BlockFields block={b} onChange={(nb) => set(i, nb)} />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(BLOCK_LABELS) as BlockType[]).map((t) => (
          <Button key={t} type="button" size="sm" variant="outline" onClick={() => onChange([...blocks, emptyBlock(t)])}>
            <Plus /> {BLOCK_LABELS[t]}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ImgField({ label, img, onChange }: { label: string; img: Img; onChange: (i: Img) => void }) {
  return <MediaField label={label} url={img.url} alt={img.alt} onChange={(url) => onChange({ ...img, url })} onAltChange={(alt) => onChange({ ...img, alt })} />;
}

function BlockFields({ block: b, onChange }: { block: Block; onChange: (b: Block) => void }) {
  switch (b.type) {
    case "heading":
      return (<div className="grid gap-3 sm:grid-cols-[1fr_3fr]"><TextField label="Eyebrow" value={b.eyebrow} onChange={(v) => onChange({ ...b, eyebrow: v })} /><TextField label="Heading" value={b.text} onChange={(v) => onChange({ ...b, text: v })} /></div>);
    case "text":
      return (<div className="space-y-3"><TextField label="Heading (optional)" value={b.heading} onChange={(v) => onChange({ ...b, heading: v })} /><TextField label="Body" multiline rows={6} hint="Blank line = new paragraph" value={b.body} onChange={(v) => onChange({ ...b, body: v })} /></div>);
    case "image":
      return (<div className="space-y-3"><ImgField label="Image" img={b.image} onChange={(image) => onChange({ ...b, image })} /><TextField label="Caption" value={b.caption} onChange={(v) => onChange({ ...b, caption: v })} /></div>);
    case "two_images":
      return (<div className="space-y-3"><div className="grid gap-3 md:grid-cols-2"><ImgField label="Left" img={b.a} onChange={(a) => onChange({ ...b, a })} /><ImgField label="Right" img={b.b} onChange={(x) => onChange({ ...b, b: x })} /></div><TextField label="Caption" value={b.caption} onChange={(v) => onChange({ ...b, caption: v })} /></div>);
    case "image_text":
      return (<div className="space-y-3"><ImgField label="Image" img={b.image} onChange={(image) => onChange({ ...b, image })} /><TextField label="Heading" value={b.heading} onChange={(v) => onChange({ ...b, heading: v })} /><TextField label="Text" multiline value={b.body} onChange={(v) => onChange({ ...b, body: v })} /></div>);
    case "gallery":
      return (
        <div className="space-y-3">
          {b.images.map((im, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-1"><ImgField label={`Image ${i + 1}`} img={im} onChange={(n) => onChange({ ...b, images: b.images.map((x, j) => (j === i ? n : x)) })} /></div>
              <Button type="button" size="icon" variant="ghost" aria-label="Remove image" onClick={() => onChange({ ...b, images: b.images.filter((_, j) => j !== i) })}><Trash2 /></Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => onChange({ ...b, images: [...b.images, { url: "", alt: "" }] })}><Plus /> Add image</Button>
        </div>
      );
    case "quote":
      return (<div className="space-y-3"><TextField label="Quote (only genuine, approved quotes)" multiline value={b.text} onChange={(v) => onChange({ ...b, text: v })} /><TextField label="Attribution" value={b.attribution} onChange={(v) => onChange({ ...b, attribution: v })} /></div>);
    case "video":
      return (<div className="space-y-3"><MediaField label="Video (upload MP4 or paste YouTube/Vimeo link)" url={b.url} onChange={(url) => onChange({ ...b, url })} /><TextField label="Caption" value={b.caption} onChange={(v) => onChange({ ...b, caption: v })} /></div>);
    case "meta":
      return (
        <div className="space-y-2">
          {b.items.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input className="flex-1 border border-input px-2 py-1 text-sm" placeholder="Label" value={m.label} onChange={(e) => onChange({ ...b, items: b.items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
              <input className="flex-[2] border border-input px-2 py-1 text-sm" placeholder="Value" value={m.value} onChange={(e) => onChange({ ...b, items: b.items.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
              <Button type="button" size="icon" variant="ghost" aria-label="Remove row" onClick={() => onChange({ ...b, items: b.items.filter((_, j) => j !== i) })}><Trash2 /></Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={() => onChange({ ...b, items: [...b.items, { label: "", value: "" }] })}><Plus /> Add row</Button>
        </div>
      );
  }
}
