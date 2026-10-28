import type { Block } from "@/lib/content";

function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

function Paras({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="mt-5 first:mt-0 whitespace-pre-line">{p}</p>
      ))}
    </>
  );
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-20 md:space-y-28">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "heading":
            return (
              <div key={i} className="container-edit">
                {b.eyebrow && <p className="label-mono text-signal">{b.eyebrow}</p>}
                <h2 className="display-lg mt-4 max-w-4xl">{b.text}</h2>
              </div>
            );
          case "text":
            return (
              <div key={i} className="container-edit grid gap-6 md:grid-cols-12">
                {b.heading && <h3 className="text-2xl font-semibold md:col-span-4">{b.heading}</h3>}
                <div className={`text-lg text-muted-foreground md:col-span-7 ${b.heading ? "md:col-start-6" : "md:col-start-4"}`}>
                  <Paras text={b.body} />
                </div>
              </div>
            );
          case "image":
            return b.image.url ? (
              <figure key={i} className="container-edit">
                <img src={b.image.url} alt={b.image.alt} loading="lazy" className="w-full" />
                {b.caption && <figcaption className="mt-3 label-mono text-muted-foreground">{b.caption}</figcaption>}
              </figure>
            ) : null;
          case "two_images":
            return (
              <figure key={i} className="container-edit">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8">
                  {[b.a, b.b].map((im, j) => im.url && <img key={j} src={im.url} alt={im.alt} loading="lazy" className="w-full" />)}
                </div>
                {b.caption && <figcaption className="mt-3 label-mono text-muted-foreground">{b.caption}</figcaption>}
              </figure>
            );
          case "image_text":
            return (
              <div key={i} className="container-edit grid items-center gap-8 md:grid-cols-12">
                {b.image.url && <img src={b.image.url} alt={b.image.alt} loading="lazy" className="w-full md:col-span-7" />}
                <div className="md:col-span-4 md:col-start-9">
                  {b.heading && <h3 className="text-2xl font-semibold">{b.heading}</h3>}
                  <div className="mt-4 text-muted-foreground"><Paras text={b.body} /></div>
                </div>
              </div>
            );
          case "gallery":
            return (
              <div key={i} className="container-edit grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                {b.images.filter((im) => im.url).map((im, j) => (
                  <img key={j} src={im.url} alt={im.alt} loading="lazy" className="aspect-square w-full object-cover" />
                ))}
              </div>
            );
          case "quote":
            return (
              <blockquote key={i} className="container-edit">
                <p className="display-md max-w-4xl"><span className="text-signal">“</span>{b.text}”</p>
                {b.attribution && <footer className="mt-6 label-mono text-muted-foreground">— {b.attribution}</footer>}
              </blockquote>
            );
          case "video": {
            const src = embedUrl(b.url);
            return (
              <figure key={i} className="container-edit">
                {src ? (
                  <div className="relative aspect-video">
                    <iframe src={src} title={b.caption || "Project video"} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" />
                  </div>
                ) : (
                  <video src={b.url} controls playsInline className="w-full" />
                )}
                {b.caption && <figcaption className="mt-3 label-mono text-muted-foreground">{b.caption}</figcaption>}
              </figure>
            );
          }
          case "meta":
            return (
              <dl key={i} className="container-edit grid gap-px bg-border sm:grid-cols-2 md:grid-cols-4">
                {b.items.filter((m) => m.label).map((m, j) => (
                  <div key={j} className="bg-background p-6">
                    <dt className="label-mono text-muted-foreground">{m.label}</dt>
                    <dd className="mt-2 font-medium">{m.value}</dd>
                  </div>
                ))}
              </dl>
            );
        }
      })}
    </div>
  );
}
