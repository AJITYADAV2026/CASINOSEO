import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const root = path.resolve(import.meta.dirname, "..");
const editions = ["2026-09-02", "2026-09-03"];
const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  for (const date of editions) {
    const markdown = await fs.readFile(path.join(root, "content", "research", `${date}.md`), "utf8");
    const [result] = await connection.execute(
      "UPDATE daily_digests SET markdownArtifact = ?, modifiedAt = COALESCE(modifiedAt, NOW()) WHERE digestDate = ?",
      [markdown, date],
    );
    if (result.affectedRows !== 1) throw new Error(`Expected one digest row for ${date}, updated ${result.affectedRows}`);
    console.log(`${date}: ${Buffer.byteLength(markdown, "utf8")} bytes stored`);
  }
} finally {
  await connection.end();
}
