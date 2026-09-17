// Copies the scraper's latest results.json into the frontend's own data
// folder, so the site build doesn't depend on the sibling scraper/ project
// at build time (and stays self-contained if this ever moves/ports).
//
// The sibling scraper/ project lives outside this git repo (it's a sibling
// of the repo root, not a subdirectory), so remote builds -- Render, GitHub
// Actions, anywhere but this machine -- never have it checked out and can
// never find results.json here. In that case, fall back to whatever
// articles.json is already committed in src/data/ instead of failing the
// build; only error out if there's truly no data to build from at all.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "..", "..", "scraper", "data", "results.json");
const destDir = join(here, "..", "src", "data");
const dest = join(destDir, "articles.json");

if (!existsSync(src)) {
  if (existsSync(dest)) {
    console.log(`No results.json found at ${src} -- using already-committed ${dest} instead.`);
    process.exit(0);
  }
  console.error(`No results.json found at ${src}, and no committed ${dest} to fall back to -- run the scraper first.`);
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`Synced ${src} -> ${dest}`);
