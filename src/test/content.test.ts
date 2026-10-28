import { describe, expect, it } from "vitest";
import { clientName, parseBlocks } from "@/lib/content";
import { enquirySchema } from "@/lib/content.functions";

describe("content rules", () => {
  it("hides the client name on confidential projects", () => {
    expect(clientName({ client: "Acme", is_confidential: true, anonymous_label: null })).toBe("Confidential client");
    expect(clientName({ client: "Acme", is_confidential: true, anonymous_label: "A fintech" })).toBe("A fintech");
    expect(clientName({ client: "Acme", is_confidential: false, anonymous_label: null })).toBe("Acme");
  });

  it("drops invalid case-study blocks", () => {
    expect(parseBlocks([{ type: "text", body: "ok" }, { type: "bogus" }])).toHaveLength(1);
  });

  it("requires name, email and need on enquiries but nothing else", () => {
    expect(enquirySchema.safeParse({ name: "A", email: "a@b.co", need: "Brand" }).success).toBe(true);
    expect(enquirySchema.safeParse({ name: "A", email: "a@b.co", need: "" }).success).toBe(false);
    expect(enquirySchema.safeParse({ name: "A", email: "nope", need: "x" }).success).toBe(false);
  });

  it("rejects submissions that fill the spam trap", () => {
    expect(enquirySchema.safeParse({ name: "A", email: "a@b.co", need: "x", fax: "spam" }).success).toBe(false);
  });
});

import { parseTeam, parseTestimonials } from "@/lib/content";
describe("team & testimonials", () => {
  it("drops team members without a name and testimonials without a quote", () => {
    expect(parseTeam({ team: [{ name: "" }, { name: "Ana", role: "Lead" }] })).toHaveLength(1);
    expect(parseTestimonials({ testimonials: [{ quote: "" }, { quote: "Great", name: "B" }] })[0]!.quote).toBe("Great");
  });
});
