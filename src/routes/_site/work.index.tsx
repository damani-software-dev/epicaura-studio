import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Eyebrow } from "@/components/site/Section";
import { ProjectCard } from "@/components/site/ProjectCard";
import { getProjects } from "@/lib/content.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/work/")({
  validateSearch: z.object({ category: z.string().optional() }),
  loader: () => getProjects(),
  head: () => ({
    meta: [
      { title: "Work — EpicAura Studio" },
      { name: "description", content: "Selected brand identity, product design and digital experience work by EpicAura Studio." },
      { property: "og:title", content: "Work — EpicAura Studio" },
      { property: "og:description", content: "Selected brand identity, product design and digital experience work." },
    ],
  }),
  component: WorkPage,
});

function WorkPage() {
  const projects = Route.useLoaderData();
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/work/" });
  const categories = Array.from(new Set(projects.flatMap((p) => p.categories))).sort();
  const list = category ? projects.filter((p) => p.categories.includes(category)) : projects;

  return (
    <div className="container-edit py-16 md:py-24">
      <Eyebrow n="W">Work</Eyebrow>
      <h1 className="display-xl mt-6 max-w-5xl">Selected projects.</h1>
      <p className="mt-8 max-w-xl text-lg text-muted-foreground">
        Brands, products and digital experiences — each shaped by the problem it needed to solve.
      </p>

      {categories.length > 0 && (
        <div role="group" aria-label="Filter by category" className="mt-14 flex flex-wrap gap-2 border-b border-border pb-6">
          {[undefined, ...categories].map((c) => {
            const active = c === category;
            return (
              <button
                key={c ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => navigate({ search: c ? { category: c } : {} })}
                className={cn(
                  "label-mono border px-3 py-2 transition-colors",
                  active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
                )}
              >
                {c ?? "All"}
              </button>
            );
          })}
        </div>
      )}

      {list.length === 0 ? (
        <div className="mt-14 border border-dashed border-border p-12 text-center">
          <p className="display-md">{projects.length ? "Nothing in this category yet." : "Case studies are on their way."}</p>
          <p className="mt-3 text-muted-foreground">
            {projects.length ? "Try another category, or view all work." : "Our selected work will appear here soon."}
          </p>
        </div>
      ) : (
        <div className="mt-14 grid gap-x-8 gap-y-20 md:grid-cols-2">
          {list.map((p, i) => (
            <div key={p.id} className={cn(i % 3 === 0 && "md:col-span-2", i % 3 === 2 && "md:mt-24")}>
              <ProjectCard project={p} index={i} size={i % 3 === 0 ? "lg" : "md"} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
