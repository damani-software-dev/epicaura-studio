import { z } from "zod";

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

/** Case-study content blocks — validated structure, flexible order. */
const img = z.object({ url: z.string(), alt: z.string().default("") });

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), eyebrow: z.string().default(""), text: z.string() }),
  z.object({ type: z.literal("text"), heading: z.string().default(""), body: z.string() }),
  z.object({ type: z.literal("image"), image: img, caption: z.string().default("") }),
  z.object({ type: z.literal("two_images"), a: img, b: img, caption: z.string().default("") }),
  z.object({ type: z.literal("image_text"), image: img, heading: z.string().default(""), body: z.string() }),
  z.object({ type: z.literal("gallery"), images: z.array(img) }),
  z.object({ type: z.literal("quote"), text: z.string(), attribution: z.string().default("") }),
  z.object({ type: z.literal("video"), url: z.string(), caption: z.string().default("") }),
  z.object({
    type: z.literal("meta"),
    items: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
]);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block["type"];

export function parseBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((b) => {
    const r = blockSchema.safeParse(b);
    return r.success ? [r.data] : [];
  });
}

export const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Section heading",
  text: "Rich-text narrative",
  image: "Full-width image",
  two_images: "Two-image composition",
  image_text: "Image with text",
  gallery: "Gallery",
  quote: "Quote (approved only)",
  video: "Video embed",
  meta: "Project metadata",
};

export function emptyBlock(type: BlockType): Block {
  const i = { url: "", alt: "" };
  switch (type) {
    case "heading": return { type, eyebrow: "", text: "" };
    case "text": return { type, heading: "", body: "" };
    case "image": return { type, image: i, caption: "" };
    case "two_images": return { type, a: i, b: { ...i }, caption: "" };
    case "image_text": return { type, image: i, heading: "", body: "" };
    case "gallery": return { type, images: [] };
    case "quote": return { type, text: "", attribution: "" };
    case "video": return { type, url: "", caption: "" };
    case "meta": return { type, items: [{ label: "", value: "" }] };
  }
}

export type Project = {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  is_confidential: boolean;
  anonymous_label: string | null;
  summary: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  thumbnail_url: string | null;
  categories: string[];
  services: string[];
  role: string | null;
  industry: string | null;
  timeline: string | null;
  blocks: Json;
  featured: boolean;
  status: string;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

export type Service = {
  id: string;
  title: string;
  slug: string;
  number: string | null;
  short_description: string | null;
  description: string | null;
  problems: string | null;
  capabilities: string[];
  media_url: string | null;
};

export type Settings = {
  logo_url: string | null;
  contact_email: string | null;
  social_links: Json;
  cta_text: string;
  footer_text: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  default_og_image: string | null;
};

/** Display name respecting confidentiality. */
export function clientName(p: Pick<Project, "client" | "is_confidential" | "anonymous_label">) {
  if (p.is_confidential) return p.anonymous_label || "Confidential client";
  return p.client || "";
}

export function socialLinks(raw: unknown): { label: string; url: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (l): l is { label: string; url: string } =>
      !!l && typeof l.label === "string" && typeof l.url === "string" && l.url.length > 0,
  );
}

/** Editable page copy with defaults so pages never render empty. */
export const PAGE_DEFAULTS = {
  home: {
    hero_title: "Build a brand.\nShape the experience.\nMove forward.",
    hero_body:
      "EpicAura partners with ambitious teams to build distinctive brands, thoughtful digital products, and digital experiences designed around what comes next.",
    intro_title: "Good design starts with understanding what needs to change.",
    intro_body:
      "Before we decide what to make, we look at the business, the people using the product, and the brand behind the experience. The work follows from that understanding — not from a template.",
    partnership_title: "One project, or a standing design partner.",
    partnership_body:
      "Some teams need a focused engagement with a clear end. Others need design capacity that stays close to the work. The right model depends on your priorities, your internal team, and the scope ahead — we shape it together.",
    cta_title: "Let's make the next move count.",
    cta_body:
      "Tell us what you're building, what needs to change, or where your team needs a design partner.",
  },
  about: {
    title: "A design partner that cares about the thinking behind the work.",
    why_title: "Why EpicAura exists",
    why_body:
      "Too much design is produced in isolation — screens without strategy, logos without a point of view. EpicAura exists to close that gap: to connect what a business intends with how its brand looks and how its products work.",
    philosophy_title: "Purposeful over decorative",
    philosophy_body:
      "We favour clarity, restraint, and decisions that can be explained. Every element should earn its place by helping someone understand, decide, or act.",
    approach_title: "Business and people, together",
    approach_body:
      "We start with the problem — commercial goals, user needs, and constraints — and treat design as the way to resolve them, not just to dress them.",
    collab_title: "Close collaboration",
    collab_body:
      "We work alongside founders and product teams, sharing work early and often. You'll see the reasoning, not just the result.",
    tech_title: "Built to be built",
    tech_body:
      "We design with implementation in mind — systems, components, and handoff that developers can actually use, and that hold up as the product grows.",
  },
} as const;

export type PageKey = keyof typeof PAGE_DEFAULTS;

export function pageCopy<K extends PageKey>(key: K, content: unknown) {
  const base = PAGE_DEFAULTS[key] as Record<string, string>;
  const c = (content && typeof content === "object" ? content : {}) as Record<string, unknown>;
  const out: Record<string, string> = { ...base };
  for (const k of Object.keys(base)) if (typeof c[k] === "string" && c[k]) out[k] = c[k] as string;
  return out as { [P in keyof (typeof PAGE_DEFAULTS)[K]]: string };
}

/** People and quotes managed in the editor (stored inside page content). */
export type TeamMember = { name: string; role: string; photo_url: string; bio: string };
export type Testimonial = { quote: string; name: string; role: string; company: string; photo_url: string };

function list<T extends Record<string, string>>(raw: unknown, keys: (keyof T)[], required: keyof T): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((r) => {
    if (!r || typeof r !== "object") return [];
    const o = {} as Record<string, string>;
    for (const k of keys) {
      const v = (r as Record<string, unknown>)[k as string];
      o[k as string] = typeof v === "string" ? v : "";
    }
    return o[required as string]?.trim() ? [o as T] : [];
  });
}
export const parseTeam = (content: unknown) =>
  list<TeamMember>((content as Record<string, unknown> | null)?.["team"], ["name", "role", "photo_url", "bio"], "name");
export const parseTestimonials = (content: unknown) =>
  list<Testimonial>((content as Record<string, unknown> | null)?.["testimonials"], ["quote", "name", "role", "company", "photo_url"], "quote");
