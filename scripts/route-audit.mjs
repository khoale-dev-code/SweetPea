import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const appDir = path.join(cwd, "app");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function routeFromFile(file) {
  let rel = path.relative(appDir, file).replaceAll("\\", "/");
  rel = rel.replace(/\/(page|route)\.(tsx|ts|jsx|js)$/, "");
  const parts = rel
    .split("/")
    .filter(Boolean)
    .filter((part) => !(part.startsWith("(") && part.endsWith(")")));
  return "/" + parts.join("/");
}

function count(content, pattern) {
  return [...content.matchAll(pattern)].length;
}

const files = walk(appDir).filter((file) => /[\\/](page|route)\.(tsx|ts|jsx|js)$/.test(file));
const rows = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const isApi = file.includes(`${path.sep}api${path.sep}`);
  const isAdminApi = file.includes(`${path.sep}api${path.sep}admin${path.sep}`);
  const route = routeFromFile(file);
  const usesStore = /getStoreData\(/.test(content);
  const usesShop = /getShopSettings\(/.test(content);
  const usesNews = /getNewsPosts\(/.test(content);
  const hasRevalidate = /export const revalidate\s*=/.test(content);
  const hasDynamic = /export const dynamic\s*=\s*["']force-dynamic["']/.test(content);
  const hasNoStore = /no-store/.test(content);
  const rawImages = count(content, /<img\b/g);
  const nextImages = count(content, /<Image\b/g);
  const videos = count(content, /<video\b/g);
  const iframes = count(content, /<iframe\b/g);

  const notes = [];

  if (!isApi && (usesStore || usesShop || usesNews) && !hasRevalidate) {
    notes.push("data page without explicit revalidate");
  }

  if (isAdminApi && !hasDynamic && !hasNoStore) {
    notes.push("admin API should stay dynamic/no-store");
  }

  if (rawImages > 0) {
    notes.push(`${rawImages} raw img`);
  }

  if (videos > 0) {
    notes.push(`${videos} video`);
  }

  if (iframes > 0) {
    notes.push(`${iframes} iframe`);
  }

  rows.push({
    route,
    kind: isApi ? "API" : "PAGE",
    data: [usesStore ? "store" : "", usesShop ? "shop" : "", usesNews ? "news" : ""].filter(Boolean).join("+") || "-",
    cache: hasDynamic ? "dynamic" : hasRevalidate ? "ISR" : hasNoStore ? "no-store" : "-",
    media: `${nextImages} Next / ${rawImages} raw / ${videos} video`,
    notes: notes.join("; ") || "OK",
  });
}

rows.sort((a, b) => a.route.localeCompare(b.route));

console.log("");
console.log("Sweet Pea production route audit");
console.log("================================");
console.table(rows);

const slowCandidates = rows.filter((row) => row.notes !== "OK" || /news|menu|admin/.test(row.route));

console.log("");
console.log("Routes worth checking first");
console.log("---------------------------");
for (const row of slowCandidates) {
  console.log(`- ${row.route.padEnd(28)} ${row.notes}`);
}

console.log("");
console.log("Interpretation");
console.log("--------------");
console.log("- / and /menu are data + media heavy; cache hits matter more than raw server CPU.");
console.log("- /news and /news/[id] can become network-heavy when posts contain video/GIF media.");
console.log("- /contact contains a Google Maps iframe; lazy loading is expected.");
console.log("- /admin and /api/admin/* should be dynamic/no-store by design.");
console.log("- Raw <img> is not automatically a problem when Cloudinary already supplies f_auto/q_auto/width transformations.");
console.log("");
