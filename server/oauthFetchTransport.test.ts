import { afterEach, describe, expect, it, vi } from "vitest";
import { createOAuthHttpClient } from "./_core/sdk";

describe("native OAuth HTTP transport", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts JSON and returns the decoded response without Axios", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ accessToken: "test-token" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    const client = createOAuthHttpClient("https://oauth.example.test/base/");
    const result = await client.post("/exchange", { code: "sample-code" });

    expect(result).toEqual({ data: { accessToken: "test-token" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("https://oauth.example.test/exchange");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "sample-code" }),
    });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("surfaces non-success responses without leaking request payloads", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      "upstream unavailable",
      { status: 503 },
    )));

    const client = createOAuthHttpClient("https://oauth.example.test");
    await expect(client.post("/userinfo", { accessToken: "secret-value" }))
      .rejects.toThrow("OAuth request failed with HTTP 503: upstream unavailable");
  });

  it("fails clearly when the OAuth base URL is unavailable", async () => {
    const client = createOAuthHttpClient("");
    await expect(client.post("/exchange", {}))
      .rejects.toThrow("OAUTH_SERVER_URL is not configured");
  });
});
