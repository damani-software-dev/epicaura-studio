import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/site/Section";
import { getServices } from "@/lib/content.functions";

export const Route = createFileRoute("/_site/services")({
  loader: () => getServices(),
  head: () => ({
    meta: [
      { title: "Services — Brand, product & digital design | EpicAura Studio" },
      { name: "description", content: "Product design, brand identity and digital experiences — connected capabilities for focused projects or ongoing partnerships." },
      { property: "og:title", content: "Services — EpicAura Studio" },
      { property: "og:description", content: "Product design, brand identity and digital experiences as one connected system." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const services = Route.useLoaderData();
  return (
    <>
      <section className="container-edit py-16 md:py-24">
        <Eyebrow n="S">Services</Eyebrow>
        <h1 className="display-xl mt-6 max-w-5xl">Connected capabilities.</h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          Brand, product and digital work that informs each other. Engage one discipline for a focused project, or combine them as your needs grow.
        </p>
        <nav aria-label="Services" className="mt-12 flex flex-wrap gap-6">
          {services.map((s) => (
            <a key={s.id} href={`#${s.slug}`} className="label-mono hover:text-signal">
              <span className="text-signal">{s.number}</span> {s.title}
            </a>
          ))}
        </nav>
      </section>

      {services.map((s, i) => (
        <section key={s.id} id={s.slug} className={`scroll-mt-20 border-t border-border py-20 md:py-28 ${i % 2 ? "bg-secondary" : ""}`}>
          <div className="container-edit grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="label-mono text-signal">{s.number}</p>
              <h2 className="display-lg mt-4">{s.title}</h2>
              <p className="mt-6 text-lg">{s.short_description}</p>
            </div>
            <div className="space-y-10 md:col-span-6 md:col-start-7">
              {s.problems && (
                <div>
                  <h3 className="label-mono text-muted-foreground">Where it helps</h3>
                  <p className="mt-3 text-lg">{s.problems}</p>
                </div>
              )}
              {s.description && (
                <div>
                  <h3 className="label-mono text-muted-foreground">How we approach it</h3>
                  <p className="mt-3 text-muted-foreground">{s.description}</p>
                </div>
              )}
              {s.capabilities.length > 0 && (
                <div>
                  <h3 className="label-mono text-muted-foreground">Deliverables</h3>
                  <ul className="mt-3 border-t border-foreground">
                    {s.capabilities.map((c) => (
                      <li key={c} className="border-b border-border py-3">{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Available as a focused project or as part of an ongoing partnership.
              </p>
              <Link to="/contact" className="link-arrow font-medium border-b border-signal pb-1">
                Talk about {s.title.toLowerCase()} <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      ))}

      <section className="bg-ink py-24 text-ink-foreground md:py-32">
        <div className="container-edit grid gap-10 md:grid-cols-12">
          <h2 className="display-lg md:col-span-6">How the pieces fit together.</h2>
          <div className="space-y-6 text-lg text-ink-muted md:col-span-5 md:col-start-8">
            <p>A brand sets the voice and visual language. A product puts that promise into people's hands. Digital experiences are where most people meet both for the first time.</p>
            <p>When the same team understands all three, decisions in one area strengthen the others. Not every project needs everything — we'll recommend only what moves your work forward.</p>
            <Button asChild variant="signal" size="xl" className="mt-4">
              <Link to="/contact">Start a project <ArrowUpRight /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
