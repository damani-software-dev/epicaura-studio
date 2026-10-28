import { createFileRoute } from "@tanstack/react-router";
import { getProjects } from "@/lib/content.functions";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const projects = await getProjects().catch(() => []);
        const paths = ["/", "/work", "/services", "/about", "/contact", ...projects.map((p) => `/work/${p.slug}`)];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths
          .map((p) => `<url><loc>${origin}${p}</loc></url>`)
          .join("")}</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
