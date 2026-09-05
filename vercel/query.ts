import type { IncomingMessage } from "node:http";

export type VercelQueryValue = string | string[];

export function installVercelQuery(req: IncomingMessage) {
  const query: Record<string, VercelQueryValue> = Object.create(null);
  const requestUrl = new URL(req.url || "/", "http://casinoverse.internal");

  for (const [key, value] of requestUrl.searchParams) {
    const current = query[key];
    if (current === undefined) query[key] = value;
    else if (Array.isArray(current)) current.push(value);
    else query[key] = [current, value];
  }

  Object.defineProperty(req, "query", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: query,
  });
}
