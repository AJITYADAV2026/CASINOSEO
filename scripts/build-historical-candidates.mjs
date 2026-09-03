import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const inputDir = path.join(root, "docs/research/historical-validated");
const outputJson = path.join(root, "docs/research/historical-candidates.json");
const outputMd = path.join(root, "docs/research/historical-candidates.md");
const columns = [
  "eventDateOrYear", "datePrecision", "title", "desk", "jurisdiction", "summary", "significance",
  "sourceName", "sourceTitle", "sourceUrl", "sourcePublishedDate", "sourceType", "confidence",
];

const records = [];
const issues = [];

for (const filename of fs.readdirSync(inputDir).filter(name => /^\d{4}\.md$/.test(name)).sort()) {
  const year = Number(filename.slice(0, 4));
  const lines = fs.readFileSync(path.join(inputDir, filename), "utf8").split(/\r?\n/);
  const parsed = lines
    .filter(line => line.startsWith("|") && !/event_date_or_year|^\|\s*:?-{3}/.test(line))
    .map(line => line.slice(1, -1).split("|").map(cell => cell.trim()))
    .filter(cells => cells.length === columns.length)
    .map(cells => Object.fromEntries(columns.map((key, index) => [key, cells[index]])));

  for (const record of parsed) {
    const eventYear = Number(record.eventDateOrYear.slice(0, 4));
    if (eventYear !== year) issues.push(`${filename}: event ${record.eventDateOrYear} falls outside ${year}`);
    if (!/^https:\/\//.test(record.sourceUrl)) issues.push(`${filename}: non-HTTPS source ${record.sourceUrl}`);
    if (!['exact', 'month', 'year'].includes(record.datePrecision)) issues.push(`${filename}: invalid date precision ${record.datePrecision}`);
    if (!['high', 'medium'].includes(record.confidence)) issues.push(`${filename}: invalid confidence ${record.confidence}`);
  }

  let eligible = parsed.filter(record => record.confidence === "high");
  if (year === 2025) eligible = eligible.filter(record => !/ROGA Marketing/i.test(record.title));
  const selected = eligible.slice(0, 2);
  if (selected.length < 2) issues.push(`${filename}: fewer than two conservative candidates`);
  selected.forEach(record => records.push({ year, ...record }));
}

fs.writeFileSync(outputJson, JSON.stringify({ generatedAt: new Date().toISOString(), records, issues }, null, 2));

const rows = records.map(record => `| ${record.year} | ${record.eventDateOrYear} | ${record.title} | ${record.desk} | ${record.jurisdiction} | ${record.sourceName} | ${record.sourceUrl} |`).join("\n");
fs.writeFileSync(outputMd, `# Conservative Historical Candidates\n\nThis deterministic consolidation selects at most two high-confidence records per completed year after the independent audit. The 2026 cutoff will be populated from CasinoVerse's existing verified 2026 story database rather than the rejected commercial-app research.\n\n| Year | Event date | Development | Desk | Jurisdiction | Source | Address |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows}\n\n## Validation Issues\n\n${issues.length ? issues.map(issue => `- ${issue}`).join("\n") : "No structural issues detected."}\n`);

console.log(JSON.stringify({ candidateRecords: records.length, representedYears: new Set(records.map(record => record.year)).size, issues }, null, 2));
