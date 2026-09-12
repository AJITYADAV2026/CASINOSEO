import express from "express";
import { describe, expect, it } from "vitest";
import { assessAgent1Delivery, registerPublicationRoutes } from "./publicationRoutes";

describe("Agent 1 delivery monitor", () => {
  it("requires the immediately preceding published IST digest with durable Markdown", () => {
    expect(assessAgent1Delivery("2026-09-05", {
      digestDate: "2026-09-04",
      status: "published",
      markdownArtifact: "# CasinoVerse Research Edition\n\nVerified source-attributed research.",
    })).toEqual({ delivered: true, expectedDigestDate: "2026-09-04", reason: "delivered" });

    expect(assessAgent1Delivery("2026-09-05", {
      digestDate: "2026-09-03",
      status: "published",
      markdownArtifact: "# Stale edition",
    })).toEqual({ delivered: false, expectedDigestDate: "2026-09-04", reason: "required-agent-1-digest-missing" });

    expect(assessAgent1Delivery("2026-09-05", {
      digestDate: "2026-09-04",
      status: "developing",
      markdownArtifact: "# Incomplete edition",
    }).delivered).toBe(false);
  });

  it("removes the standalone monitor endpoint after unifying the daily automation", () => {
    const app = express();
    registerPublicationRoutes(app);
    const paths = (app as unknown as { _router?: { stack?: Array<{ route?: { path?: string } }> } })._router?.stack?.map(layer => layer.route?.path).filter(Boolean) ?? [];
    expect(paths).toContain("/api/scheduled/daily-digest");
    expect(paths).not.toContain("/api/scheduled/agent-1-delivery-monitor");
  });
});
