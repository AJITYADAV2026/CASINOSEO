import type { IncomingMessage } from "node:http";
import { describe, expect, it, vi } from "vitest";
import { installVercelQuery } from "../vercel/query";

describe("Vercel request query shim", () => {
  it("shadows the managed-runtime getter without reading it", () => {
    const getter = vi.fn(() => ({ legacy: "value" }));
    const prototype = Object.create(null);
    Object.defineProperty(prototype, "query", { configurable: true, get: getter });
    const req = Object.assign(Object.create(prototype), {
      url: "/api/oauth/callback?code=sample&state=return%2Fhome&tag=a&tag=b",
    }) as IncomingMessage;

    installVercelQuery(req);

    expect(getter).not.toHaveBeenCalled();
    expect((req as IncomingMessage & { query: Record<string, string | string[]> }).query).toEqual({
      code: "sample",
      state: "return/home",
      tag: ["a", "b"],
    });
  });

  it("installs an empty query object for requests without a query string", () => {
    const req = { url: "/history" } as IncomingMessage;
    installVercelQuery(req);
    expect((req as IncomingMessage & { query: Record<string, string> }).query).toEqual({});
  });
});
