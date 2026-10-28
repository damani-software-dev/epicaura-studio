import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { Json, Project, Service, Settings } from "./content";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (data ?? null) as Settings | null;
});

export const getProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load projects");
  return (data ?? []) as unknown as Project[];
});

export const getProject = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row } = await publicClient()
      .from("projects")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    return (row ?? null) as unknown as Project | null;
  });

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("services")
    .select("*")
    .eq("status", "published")
    .order("sort_order");
  if (error) throw new Error("Could not load services");
  return (data ?? []) as unknown as Service[];
});

export const getPage = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(60) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row } = await publicClient()
      .from("pages")
      .select("content, seo_title, seo_description")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    return (row ?? null) as { content: Json; seo_title: string | null; seo_description: string | null } | null;
  });

export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(120),
  email: z.string().trim().email("Please use a valid email").max(200),
  company: z.string().trim().max(160).optional().default(""),
  website: z.string().trim().max(300).optional().default(""),
  need: z.string().trim().min(1, "Tell us briefly what you need").max(500),
  services: z.array(z.string().max(60)).max(6).default([]),
  context: z.string().trim().max(4000).optional().default(""),
  engagement: z.string().max(60).optional().default(""),
  budget: z.string().max(60).optional().default(""),
  timeline: z.string().max(60).optional().default(""),
  // honeypot — must stay empty
  fax: z.string().max(0).optional().default(""),
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => enquirySchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { fax: _f, ...row } = data;
    const { error } = await supabaseAdmin.from("enquiries").insert({
      ...row,
      company: row.company || null,
      website: row.website || null,
      context: row.context || null,
      engagement: row.engagement || null,
      budget: row.budget || null,
      timeline: row.timeline || null,
    });
    if (error) throw new Error("We couldn't save your enquiry. Please try again.");
    return { ok: true };
  });
