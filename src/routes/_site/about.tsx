import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/site/Section";
import { getPage } from "@/lib/content.functions";
import { pageCopy, parseTeam } from "@/lib/content";

export const Route = createFileRoute("/_site/about")({
  loader: () => getPage({ data: { slug: "about" } }).catch(() => null),
  head: ({ loaderData }) => {
    const title = loaderData?.seo_title || "About — EpicAura Studio";
    const desc = loaderData?.seo_description || "Why EpicAura exists, how we think about design, and how we work with founders and product teams.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: About,
});

function About() {
  const page = Route.useLoaderData();
  const c = pageCopy("about", page?.content);
  const team = parseTeam(page?.content);
  const items = [
    [c.philosophy_title, c.philosophy_body],
    [c.approach_title, c.approach_body],
    [c.collab_title, c.collab_body],
    [c.tech_title, c.tech_body],
  ];
  return (
    <>
      <section className="container-edit py-16 md:py-24">
        <Eyebrow n="A">About</Eyebrow>
        <h1 className="display-xl mt-6 max-w-6xl">{c.title}</h1>
      </section>
      <section className="border-t border-border py-20 md:py-28">
        <div className="container-edit grid gap-10 md:grid-cols-12">
          <h2 className="label-mono text-signal md:col-span-3">{c.why_title}</h2>
          <p className="display-md md:col-span-8 md:col-start-5">{c.why_body}</p>
        </div>
      </section>
      <section className="bg-secondary py-20 md:py-28">
        <ol className="container-edit grid gap-px bg-border md:grid-cols-2">
          {items.map(([t, b], i) => (
            <li key={t} className="bg-secondary p-8 md:p-12">
              <span className="label-mono text-signal">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-3xl font-semibold">{t}</h3>
              <p className="mt-4 max-w-md text-muted-foreground">{b}</p>
            </li>
          ))}
        </ol>
      </section>
      {team.length > 0 && (
        <section className="py-20 md:py-28" aria-labelledby="team-h">
          <div className="container-edit">
            <Eyebrow n="B">Team</Eyebrow>
            <h2 id="team-h" className="display-lg mt-5">The people behind the work.</h2>
            <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((m, i) => (
                <li key={i}>
                  <div className="aspect-[4/5] overflow-hidden bg-secondary">
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover grayscale transition duration-700 hover:grayscale-0" loading="lazy" />
                    ) : (
                      <span className="grid h-full place-items-center display-lg text-muted-foreground">{m.name.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold">{m.name}</h3>
                  {m.role && <p className="label-mono mt-2 text-signal">{m.role}</p>}
                  {m.bio && <p className="mt-3 text-muted-foreground">{m.bio}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <section className="container-edit flex flex-col gap-8 py-24 md:flex-row md:items-end md:justify-between">
        <h2 className="display-lg max-w-2xl">Curious whether we're the right fit?</h2>
        <Button asChild variant="signal" size="xl">
          <Link to="/contact">Start a conversation <ArrowUpRight /></Link>
        </Button>
      </section>
    </>
  );
}
