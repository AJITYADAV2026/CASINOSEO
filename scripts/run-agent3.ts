import fs from "node:fs/promises";
import path from "node:path";
import { runPageCreation } from "../server/pageCreation";

const result = await runPageCreation({ includeDraft: true, force: true });

if (!("manifest" in result) || !result.manifest) {
  console.log(JSON.stringify(result));
  process.exit(0);
}

const directory = path.resolve(import.meta.dirname, "..", "content", "urls");
const filePath = path.join(directory, `url-${result.manifest.manifestDate}.md`);
await fs.mkdir(directory, { recursive: true });
await fs.writeFile(filePath, result.manifest.markdownArtifact, "utf8");

console.log(JSON.stringify({
  manifestDate: result.manifest.manifestDate,
  sourceReportDate: result.manifest.sourceReportDate,
  status: result.manifest.status,
  counts: {
    created: result.manifest.createdCount,
    updated: result.manifest.updatedCount,
    retained: result.manifest.retainedCount,
    archived: result.manifest.archivedCount,
    reviewRequired: result.manifest.reviewCount,
  },
  filePath,
}, null, 2));
process.exit(0);
