import type { IncomingMessage, ServerResponse } from "node:http";
import { createCasinoVerseApp } from "../server/_core/app";
import { serveStatic } from "../server/_core/staticSsr";

const app = createCasinoVerseApp();
let ready: Promise<void> | null = null;

function ensureReady() {
  ready ??= serveStatic(app);
  return ready;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureReady();
  return app(req, res);
}
