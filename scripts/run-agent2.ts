import fs from "node:fs/promises";
import path from "node:path";
import { runContentAnalysis } from "../server/contentAnalysis";

const result = await runContentAnalysis({ includeDeveloping: true, force: true });

if (!("report" in result) || !result.report) {
  console.log(JSON.stringify(result));
  process.exit(0);
}

const directory = path.resolve(import.meta.dirname, "..", "content", "site-find");
const filePath = path.join(directory, `site-find-${result.report.reportDate}.md`);
await fs.mkdir(directory, { recursive: true });
await fs.writeFile(filePath, result.report.markdownArtifact, "utf8");

console.log(JSON.stringify({
  reportDate: result.report.reportDate,
  sourceDigestDate: result.report.sourceDigestDate,
  status: result.report.status,
  model: result.report.modelId,
  decisions: {
    add: result.report.addCount,
    update: result.report.updateCount,
    retain: result.report.retainCount,
    archive: result.report.archiveCount,
    remove: result.report.removeCount,
  },
  filePath,
}, null, 2));
process.exit(0);
