import { describe, expect, it } from "vitest";
import { digestPayloadSchema } from "./publicationRoutes";

const basePayload = {
  digestDate: "2026-09-03",
  title: "CasinoVerse Daily Research Digest — 3 September 2026",
  summary: "A source-attributed summary of the material casino-industry developments for the completed IST calendar day.",
  body: "This completed daily edition places verified industry developments in context and links every material statement to its original source.",
  markdownArtifact: "# CasinoVerse Daily Research Digest — 3 September 2026\n\n## Research window\n\nThis edition covers the completed India Standard Time calendar day.\n\n## Verified developments\n\nOriginal CasinoVerse analysis with visible sources.\n\n## References\n\n1. [Official source](https://example.com/source)",
  status: "published" as const,
  stories: [{
    slug: "verified-market-development",
    title: "Verified market development receives contextual analysis",
    dek: "CasinoVerse explains the reported development while preserving the original source and uncertainty labels.",
    body: "The research desk reviewed the original publication, separated reported facts from interpretation, and retained direct attribution for readers.",
    contentType: "news" as const,
    categorySlug: "market-intelligence",
    authorName: "CasinoVerse Research Desk",
    readingMinutes: 3,
    publishedAt: "2026-09-03T12:00:00.000Z",
    sources: [{
      publisher: "Official source",
      sourceTitle: "Official source material",
      sourceUrl: "https://example.com/source",
      sourcePublishedAt: "2026-09-03T11:00:00.000Z",
      sourceType: "official" as const,
    }],
  }],
};

describe("scheduled daily digest payload", () => {
  it("accepts a complete durable Markdown research artifact", () => {
    const result = digestPayloadSchema.parse(basePayload);
    expect(result.markdownArtifact).toContain("## References");
    expect(result.stories).toHaveLength(1);
  });

  it("rejects payloads that omit durable Markdown research", () => {
    const { markdownArtifact: _omitted, ...withoutMarkdown } = basePayload;
    expect(() => digestPayloadSchema.parse(withoutMarkdown)).toThrow();
  });
});
