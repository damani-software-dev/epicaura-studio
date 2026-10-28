import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow, Lines } from "@/components/site/Section";
import { ProjectCard } from "@/components/site/ProjectCard";
import { getPage, getProjects, getServices } from "@/lib/content.functions";
import { pageCopy, parseTestimonials } from "@/lib/content";

export const Route = createFileRoute("/_site/")({
  loader: async () => {
    const [projects, services, page] = await Promise.all([
      getProjects().catch(() => []),
      getServices().catch(() => []),
      getPage({ data: { slug: "home" } }).catch(() => null),
    ]);
    return { projects, services, page };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.page?.seo_title || "EpicAura Studio — Strategic design for brands & products";
    const description =
      loaderData?.page?.seo_description ||
      "EpicAura partners with ambitious teams to build distinctive brands, thoughtful digital products and digital experiences.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Home,
});

const STAGES = [
  { k: "Align", d: "Understand the business, audience, challenges and priorities." },
  { k: "Sprint", d: "Explore, design, prototype and refine a focused solution." },
  { k: "Evolve", d: "Keep improving the brand or product as needs develop." },
];

function Home() {
  const { projects, services, page } = Route.useLoaderData();
  const c = pageCopy("home", page?.content);
  const featured = (projects.filter((p) => p.featured).length ? projects.filter((p) => p.featured) : projects).slice(0, 4);
  const [lead, ...rest] = featured;
  const testimonials = parseTestimonials(page?.content);

  return (
    <>
      {/* Hero */}
      <section className="container-edit grid gap-10 pb-20 pt-14 md:grid-cols-12 md:pt-24">
        <div className="md:col-span-12">
          <Eyebrow n="EA">Strategic design partner</Eyebrow>
        </div>
        <h1 className="display-xl animate-rise md:col-span-10">
          <Lines text={c.hero_title} />
        </h1>
        <div className="flex flex-col justify-end md:col-span-2 md:items-end">
          <span aria-hidden className="block size-16 bg-signal md:size-24" />
        </div>
        <div className="md:col-span-5 md:col-start-7">
          <p className="text-lg text-muted-foreground md:text-xl">{c.hero_body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="signal" size="xl">
              <Link to="/contact">
                Start a project <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild variant="line" size="xl">
              <Link to="/work">Explore our work</Link>
            </Button>
          </div>
        </div>
        <ul className="label-mono flex flex-wrap gap-x-6 gap-y-2 self-end text-muted-foreground md:col-span-5 md:col-start-1 md:row-start-4">
          <li>Brand identity</li>
          <li>/ Product design</li>
          <li>/ Digital experiences</li>
        </ul>
      </section>

      {/* Selected work */}
      <section className="border-t border-border py-20 md:py-28" aria-labelledby="work-h">
        <div className="container-edit">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <Eyebrow n="01">Selected work</Eyebrow>
              <h2 id="work-h" className="display-lg mt-5">Work with a point of view.</h2>
            </div>
            <Link to="/work" className="link-arrow hidden text-sm font-medium md:inline-flex">
              All projects <ArrowRight className="size-4" />
            </Link>
          </div>
          {lead ? (
            <div className="grid gap-x-8 gap-y-16 md:grid-cols-12">
              <div className="md:col-span-12">
                <ProjectCard project={lead} index={0} size="lg" />
              </div>
              {rest.map((p, i) => (
                <div key={p.id} className={i % 2 === 0 ? "md:col-span-5" : "md:col-span-6 md:col-start-7 md:mt-32"}>
                  <ProjectCard project={p} index={i + 1} />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border p-12 text-center">
              <p className="display-md">Case studies are on their way.</p>
              <p className="mt-3 text-muted-foreground">We're preparing our selected work. In the meantime, let's talk about yours.</p>
            </div>
          )}
          <Link to="/work" className="link-arrow mt-12 text-sm font-medium md:hidden">
            All projects <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-ink py-24 text-ink-foreground md:py-36">
        <div className="container-edit grid gap-10 md:grid-cols-12">
          <Eyebrow n="02" className="text-ink-muted md:col-span-3">The studio</Eyebrow>
          <div className="md:col-span-9">
            <h2 className="display-lg">{c.intro_title}</h2>
            <p className="mt-10 max-w-2xl text-lg text-ink-muted md:ml-auto md:text-xl">{c.intro_body}</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 md:py-28" aria-labelledby="svc-h">
        <div className="container-edit">
          <Eyebrow n="03">Capabilities</Eyebrow>
          <h2 id="svc-h" className="display-lg mt-5 max-w-4xl">Three disciplines. One connected system.</h2>
          <div className="mt-16 border-t border-foreground">
            {services.map((s) => (
              <Link
                key={s.id}
                to="/services"
                hash={s.slug}
                className="group grid gap-4 border-b border-border py-8 transition-colors md:grid-cols-12 md:items-baseline"
              >
                <span className="label-mono text-signal md:col-span-1">{s.number}</span>
                <h3 className="display-md md:col-span-4 transition-transform duration-500 group-hover:translate-x-2">
                  {s.title}
                </h3>
                <p className="text-muted-foreground md:col-span-5">{s.short_description}</p>
                <ArrowUpRight className="hidden size-6 justify-self-end transition-colors group-hover:text-signal md:col-span-2 md:block" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="border-t border-border bg-secondary py-20 md:py-28">
        <div className="container-edit">
          <Eyebrow n="04">How we work</Eyebrow>
          <h2 className="display-lg mt-5">
            Align <span className="text-signal">→</span> Sprint <span className="text-signal">→</span> Evolve
          </h2>
          <ol className="mt-16 grid gap-px bg-border md:grid-cols-3">
            {STAGES.map((s, i) => (
              <li key={s.k} className="relative bg-secondary p-8 pt-12 md:p-10 md:pt-16">
                <span className="label-mono text-muted-foreground">Stage {String(i + 1).padStart(2, "0")}</span>
                <p className="display-md mt-4">{s.k}</p>
                <p className="mt-4 max-w-xs text-muted-foreground">{s.d}</p>
                <span aria-hidden className="absolute left-0 top-0 h-1 bg-signal" style={{ width: `${(i + 1) * 33.33}%` }} />
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted-foreground">
            Every engagement is shaped around its scope — timelines and deliverables are agreed together.
          </p>
        </div>
      </section>

      {/* Partnership */}
      <section className="py-20 md:py-28">
        <div className="container-edit grid gap-10 md:grid-cols-12">
          <h2 className="display-lg md:col-span-7">{c.partnership_title}</h2>
          <div className="md:col-span-4 md:col-start-9 md:pt-4">
            <p className="text-lg text-muted-foreground">{c.partnership_body}</p>
            <Link to="/contact" className="link-arrow mt-8 font-medium border-b border-signal pb-1">
              Discuss the right model <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="border-t border-border py-20 md:py-28" aria-labelledby="tst-h">
          <div className="container-edit">
            <Eyebrow n="05">Client words</Eyebrow>
            <h2 id="tst-h" className="display-lg mt-5">What clients say.</h2>
            <ul className={`mt-16 grid gap-px bg-border ${testimonials.length > 1 ? "md:grid-cols-2" : ""}`}>
              {testimonials.map((t, i) => (
                <li key={i} className="flex flex-col justify-between gap-10 bg-background p-8 md:p-12">
                  <blockquote className="text-2xl font-medium leading-snug md:text-3xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                    <span className="text-signal">“</span>{t.quote}<span className="text-signal">”</span>
                  </blockquote>
                  <figcaption className="flex items-center gap-4">
                    {t.photo_url && <img src={t.photo_url} alt="" className="size-12 rounded-full object-cover" loading="lazy" />}
                    <span>
                      <span className="block font-semibold">{t.name}</span>
                      <span className="text-sm text-muted-foreground">{[t.role, t.company].filter(Boolean).join(", ")}</span>
                    </span>
                  </figcaption>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-signal text-signal-foreground">
        <div className="container-edit py-24 md:py-36">
          <h2 className="display-xl max-w-5xl">{c.cta_title}</h2>
          <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-lg">{c.cta_body}</p>
            <Button asChild variant="ink" size="xl">
              <Link to="/contact">
                Start a conversation <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
