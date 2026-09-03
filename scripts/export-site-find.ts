import fs from "node:fs/promises";
import path from "node:path";
import { getSiteFindReportByDate } from "../server/db";

const date = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) {
  throw new Error("Usage: pnpm exec tsx scripts/export-site-find.ts YYYY-MM-DD");
}

const report = await getSiteFindReportByDate(date);
if (!report) throw new Error(`No Site Find report exists for ${date}`);

const directory = path.resolve(import.meta.dirname, "..", "content", "site-find");
const filePath = path.join(directory, `site-find-${date}.md`);
await fs.mkdir(directory, { recursive: true });
await fs.writeFile(filePath, report.markdownArtifact, "utf8");
console.log(JSON.stringify({ filePath, bytes: Buffer.byteLength(report.markdownArtifact), status: report.status, model: report.modelId }, null, 2));
process.exit(0);
