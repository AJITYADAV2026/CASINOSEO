import { describe, expect, it } from "vitest";

describe("CasinooVerse configured publication name", () => {
  it("exposes the updated SITE_NAME through the live RSS endpoint", async () => {
    expect(process.env.SITE_NAME).toBe("CasinooVerse");
    expect(process.env.VITE_APP_TITLE).toBe("CasinooVerse");

    const response = await fetch("http://localhost:3000/rss.xml");
    expect(response.ok).toBe(true);
    expect(response.headers.get("content-type")).toContain("application/rss+xml");
    const body = await response.text();
    expect(body).toContain("<title>CasinooVerse</title>");
  }, 15_000);
});
