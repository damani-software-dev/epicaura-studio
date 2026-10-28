import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { clientName, type Project } from "@/lib/content";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  index,
  size = "md",
}: {
  project: Project;
  index?: number;
  size?: "lg" | "md";
}) {
  const img = project.thumbnail_url || project.cover_url;
  const client = clientName(project);
  return (
    <Link
      to="/work/$slug"
      params={{ slug: project.slug }}
      className="group block"
    >
      <div className={cn("img-reveal relative bg-muted", size === "lg" ? "aspect-[16/10]" : "aspect-[4/5]")}>
        {img ? (
          <img
            src={img}
            alt={project.cover_alt || project.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-6">
            <span className="display-md text-muted-foreground/40">{project.title}</span>
          </div>
        )}
        <span className="absolute right-4 top-4 grid size-10 place-items-center bg-background opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-signal">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-6">
        <div>
          <h3 className={cn("font-semibold", size === "lg" ? "display-md" : "text-2xl")}>{project.title}</h3>
          {project.summary && (
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{project.summary}</p>
          )}
        </div>
        <div className="shrink-0 text-right label-mono text-muted-foreground">
          {index !== undefined && <span className="text-signal">{String(index + 1).padStart(2, "0")}</span>}
          {client && <p className="mt-1">{client}</p>}
          {project.categories[0] && <p className="mt-1">{project.categories[0]}</p>}
        </div>
      </div>
    </Link>
  );
}
