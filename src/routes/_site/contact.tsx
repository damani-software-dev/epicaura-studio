import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/site/Section";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Start a project with EpicAura Studio" },
      { name: "description", content: "Email EpicAura Studio about what you're building, what needs to change, or where your team needs a design partner." },
      { property: "og:title", content: "Start a project — EpicAura Studio" },
      { property: "og:description", content: "Email us about what you're building and where you need a design partner." },
    ],
  }),
  component: Contact,
});

const site = getRouteApi("/_site");
const PROMPTS = [
  "What you're building, and for whom",
  "What needs to change — brand, product, or both",
  "Any timeline or budget you have in mind",
  "Links to anything that helps us understand it",
];

function Contact() {
  const { settings } = site.useLoaderData();
  const email = settings?.contact_email || "info@epicaurastudio.com";
  const subject = encodeURIComponent("New project enquiry");
  return (
    <section className="container-edit py-16 md:py-24">
      <Eyebrow n="C">Contact</Eyebrow>
      <h1 className="display-xl mt-6 max-w-5xl">Tell us what you're building.</h1>
      <div className="mt-16 grid gap-16 border-t border-border pt-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="label-mono text-muted-foreground">Email the studio</p>
          <a href={`mailto:${email}?subject=${subject}`} className="display-md mt-4 block break-all underline decoration-signal decoration-2 underline-offset-8 hover:text-signal">
            {email}
          </a>
          <Button asChild variant="signal" size="xl" className="mt-10">
            <a href={`mailto:${email}?subject=${subject}`}>Write to us <ArrowUpRight /></a>
          </Button>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <p className="label-mono text-muted-foreground">Helpful to include</p>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {PROMPTS.map((p, i) => (
              <li key={p} className="flex gap-4 py-4">
                <span className="label-mono text-signal">{String(i + 1).padStart(2, "0")}</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
