// Copies the scraper's latest results.json into the frontend's own data
// folder, so the site build doesn't depend on the sibling scraper/ project
// at build time (and stays self-contained if this ever moves/ports).
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..", "..", "scraper", "data", "results.json");
const destDir = join(here, "..", "src", "data");
const dest = join(destDir, "articles.json");

if (!existsSync(src)) {
  console.error(`No results.json found at ${src} -- run the scraper first.`);
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`Synced ${src} -> ${dest}`);
