import type { Express } from "express";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key || key.includes("..") || !/^[A-Za-z0-9._/-]+$/.test(key)) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      if (!ENV.assetOrigin) {
        res.status(500).send("Storage proxy not configured");
        return;
      }

      try {
        const assetUrl = new URL(`/manus-storage/${key}`, ENV.assetOrigin);
        const assetResp = await fetch(assetUrl, { redirect: "follow" });

        if (!assetResp.ok) {
          console.error(`[StorageProxy] public asset error: ${assetResp.status}`);
          res.status(assetResp.status === 404 ? 404 : 502).send("Storage asset unavailable");
          return;
        }

        const contentType = assetResp.headers.get("content-type");
        const etag = assetResp.headers.get("etag");
        const lastModified = assetResp.headers.get("last-modified");
        if (contentType) res.set("Content-Type", contentType);
        if (etag) res.set("ETag", etag);
        if (lastModified) res.set("Last-Modified", lastModified);
        res.set("Cache-Control", "public, max-age=86400, s-maxage=31536000, immutable");
        res.set("X-Content-Type-Options", "nosniff");
        res.status(200).send(Buffer.from(await assetResp.arrayBuffer()));
      } catch (err) {
        console.error("[StorageProxy] public asset fallback failed:", err);
        res.status(502).send("Storage asset unavailable");
      }
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
