import express from "express";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ENV } from "./_core/env";
import { registerStorageProxy } from "./_core/storageProxy";

const originalFetch = global.fetch;
const originalForgeUrl = ENV.forgeApiUrl;
const originalForgeKey = ENV.forgeApiKey;
const originalAssetOrigin = ENV.assetOrigin;

async function requestAsset(path: string) {
  const app = express();
  registerStorageProxy(app);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;

  try {
    return await new Promise<{ status: number; headers: Headers; body: Buffer }>((resolve, reject) => {
      import("node:http").then(({ get }) => {
        get(`http://127.0.0.1:${port}${path}`, response => {
          const chunks: Buffer[] = [];
          response.on("data", chunk => chunks.push(Buffer.from(chunk)));
          response.on("end", () =>
            resolve({
              status: response.statusCode ?? 0,
              headers: new Headers(response.headers as Record<string, string>),
              body: Buffer.concat(chunks),
            }),
          );
        }).on("error", reject);
      }).catch(reject);
    });
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve())),
    );
  }
}

describe("storage proxy fallback", () => {
  beforeEach(() => {
    ENV.forgeApiUrl = "";
    ENV.forgeApiKey = "";
    ENV.assetOrigin = "https://casinonews-flgw988r.manus.space";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    ENV.forgeApiUrl = originalForgeUrl;
    ENV.forgeApiKey = originalForgeKey;
    ENV.assetOrigin = originalAssetOrigin;
    vi.restoreAllMocks();
  });

  it("proxies an existing same-path image without storage credentials", async () => {
    global.fetch = vi.fn(async input => {
      expect(String(input)).toBe(
        "https://casinonews-flgw988r.manus.space/manus-storage/casino-home.jpg",
      );
      return new Response(Uint8Array.from([1, 2, 3]), {
        status: 200,
        headers: { "content-type": "image/jpeg", etag: '"asset-v1"' },
      });
    });

    const response = await requestAsset("/manus-storage/casino-home.jpg");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/jpeg");
    expect(response.headers.get("cache-control")).toContain("s-maxage=31536000");
    expect(response.body).toEqual(Buffer.from([1, 2, 3]));
  });

  it("fails closed when neither storage credentials nor a public asset origin exist", async () => {
    ENV.assetOrigin = "";
    const response = await requestAsset("/manus-storage/casino-home.jpg");
    expect(response.status).toBe(500);
    expect(response.body.toString()).toContain("Storage proxy not configured");
  });
});
