import { describe, expect, it } from "vitest";
import { parseCookieConsent, shouldLoadAnalytics } from "./lib/consent";
import fs from "node:fs";
import path from "node:path";

describe("cookie consent", () => {
  it("accepts only the current supported stored choices", () => {
    expect(parseCookieConsent(JSON.stringify({ choice: "accepted", version: 1, updatedAt: "2026-09-03T00:00:00.000Z" }))).toBe("accepted");
    expect(parseCookieConsent(JSON.stringify({ choice: "essential", version: 1, updatedAt: "2026-09-03T00:00:00.000Z" }))).toBe("essential");
    expect(parseCookieConsent(JSON.stringify({ choice: "accepted", version: 2 }))).toBeNull();
    expect(parseCookieConsent("not-json")).toBeNull();
  });

  it("loads analytics only after explicit acceptance", () => {
    expect(shouldLoadAnalytics(null)).toBe(false);
    expect(shouldLoadAnalytics("essential")).toBe(false);
    expect(shouldLoadAnalytics("accepted")).toBe(true);
  });

  it("does not include an unconditional analytics script in the HTML shell", () => {
    const html = fs.readFileSync(path.resolve(process.cwd(), "client/index.html"), "utf8");
    expect(html).not.toContain("data-website-id");
    expect(html).not.toContain("%VITE_ANALYTICS_ENDPOINT%/umami");
  });
});
