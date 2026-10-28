import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/site/BlockRenderer";
import { ProjectCard } from "@/components/site/ProjectCard";
import { getProject, getProjects } from "@/lib/content.functions";
import { clientName, parseBlocks } from "@/lib/content";

export const Route = createFileRoute("/_site/work/$slug")({
  loader: async ({ params }) => {
    const [project, all] = await Promise.all([
      getProject({ data: { slug: params.slug } }),
      getProjects().catch(() => []),
    ]);
    if (!project) throw notFound();
    const related = all
      .filter((p) => p.id !== project.id)
      .sort((a, b) => Number(b.categories.some((c) => project.categories.includes(c))) - Number(a.categories.some((c) => project.categories.includes(c))))
      .slice(0, 2);
    return { project, related };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Project not found — EpicAura Studio" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.project;
    const title = p.seo_title || `${p.title} — EpicAura Studio`;
    const desc = p.seo_description || p.summary || `${p.title}, a case study by EpicAura Studio.`;
    const img = p.cover_url?.startsWith("https://") ? p.cover_url : null;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-edit py-32">
      <h1 className="display-lg">That project isn't here.</h1>
      <Link to="/work" className="mt-6 inline-block underline">Back to all work</Link>
    </div>
  ),
  component: CaseStudy,
});

function CaseStudy() {
  const { project: p, related } = Route.useLoaderData();
  const blocks = parseBlocks(p.blocks);
  const client = clientName(p);
  const meta = [
    { k: "Client", v: client },
    { k: "Industry", v: p.industry },
    { k: "Role", v: p.role },
    { k: "Timeline", v: p.timeline },
    { k: "Services", v: p.services.join(", ") },
  ].filter((m) => m.v);

  return (
    <article>
      <header className="container-edit pb-12 pt-14 md:pt-24">
        <Link to="/work" className="label-mono text-muted-foreground hover:text-foreground">← Work</Link>
        <div className="mt-8 flex flex-wrap gap-2">
          {p.categories.map((c) => (
            <span key={c} className="label-mono border border-border px-2 py-1">{c}</span>
          ))}
        </div>
        <h1 className="display-xl mt-6 max-w-6xl">{p.title}</h1>
        <div className="mt-12 grid gap-10 md:grid-cols-12">
          {p.summary && <p className="text-xl md:col-span-6">{p.summary}</p>}
          <dl className="grid grid-cols-2 gap-6 md:col-span-5 md:col-start-8">
            {meta.map((m) => (
              <div key={m.k}>
                <dt className="label-mono text-signal">{m.k}</dt>
                <dd className="mt-1 text-sm">{m.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>
      {p.cover_url && (
        <div className="container-edit">
          <img src={p.cover_url} alt={p.cover_alt || p.title} className="w-full" />
        </div>
      )}
      {blocks.length > 0 && (
        <div className="py-20 md:py-28">
          <BlockRenderer blocks={blocks} />
        </div>
      )}

      {related.length > 0 && (
        <section className="border-t border-border py-20">
          <div className="container-edit">
            <p className="label-mono text-muted-foreground">More work</p>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {related.map((r, i) => <ProjectCard key={r.id} project={r} index={i} />)}
            </div>
          </div>
        </section>
      )}

      <section className="bg-ink text-ink-foreground">
        <div className="container-edit flex flex-col gap-8 py-20 md:flex-row md:items-end md:justify-between">
          <h2 className="display-lg max-w-2xl">Have something similar in mind?</h2>
          <Button asChild variant="signal" size="xl">
            <Link to="/contact">Start a project <ArrowUpRight /></Link>
          </Button>
        </div>
      </section>
    </article>
  );
}
