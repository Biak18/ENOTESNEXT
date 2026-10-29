import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const roots = ["ag-grid-community", "ag-grid-react", "write-excel-file", "fflate"];
const permissive = /^(MIT|ISC|Apache-2\.0|BSD-2-Clause|BSD-3-Clause|0BSD|Unlicense|CC0-1\.0)$/;

function readManifest(packageDir) {
  const manifestPath = resolve(packageDir, "package.json");
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function resolveDependency(fromDir, dependencyName) {
  let current = fromDir;
  while (true) {
    const candidate = resolve(current, "node_modules", dependencyName, "package.json");
    if (existsSync(candidate)) return dirname(candidate);
    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

const seen = new Map();
const queue = roots.map((name) => ({ name, fromDir: projectRoot }));

while (queue.length) {
  const { name, fromDir } = queue.shift();
  const located = resolveDependency(fromDir, name);
  if (!located) {
    seen.set(name, { name, version: "not installed", license: "unknown" });
    continue;
  }
  if (seen.has(name)) continue;
  const manifest = readManifest(located);
  seen.set(name, {
    name,
    version: manifest.version ?? "unknown",
    license: typeof manifest.license === "string" ? manifest.license : JSON.stringify(manifest.license ?? "unknown"),
  });
  for (const dependency of Object.keys(manifest.dependencies ?? {})) {
    queue.push({ name: dependency, fromDir: located });
  }
}

const rows = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
const width = Math.max(...rows.map((row) => row.name.length), 4);

console.log("ENOTES grid/export dependency license audit");
console.log("-".repeat(width + 30));
for (const row of rows) {
  console.log(`${row.name.padEnd(width)}  ${row.version.padEnd(12)}  ${row.license}`);
}

const blocked = rows.filter((row) => !permissive.test(row.license));
console.log("-".repeat(width + 30));
if (blocked.length) {
  console.error(`Blocked licenses: ${blocked.map((row) => `${row.name} (${row.license})`).join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`All ${rows.length} packages use permissive licenses compatible with commercial use.`);
}
