import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const esbuild = resolve(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "esbuild.cmd" : "esbuild",
);
const output = resolve(root, "api", "index.mjs");

mkdirSync(dirname(output), { recursive: true });
execFileSync(
  esbuild,
  [
    resolve(root, "vercel", "entry.ts"),
    "--platform=node",
    "--bundle",
    "--packages=external",
    "--format=esm",
    `--outfile=${output}`,
  ],
  { cwd: root, stdio: "inherit", env: { ...process.env, NODE_ENV: "production" } },
);

console.log("Prepared self-contained Vercel function at api/index.mjs");
