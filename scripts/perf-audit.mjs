const baseArg = process.argv[2] || "http://localhost:3000";
const base = baseArg.replace(/\/+$/, "");

const routes = [
  "/",
  "/menu",
  "/about",
  "/news",
  "/contact",
  "/api/public/menu",
];

const rounds = 3;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

async function measure(route) {
  const url = `${base}${route}`;

  // Warm request so the measured rounds reflect the normal CDN/data-cache path.
  try {
    const warm = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "sweet-pea-perf-audit/3.8" },
    });
    await warm.arrayBuffer();
  } catch {
    // The measured requests below will report the real error.
  }

  const runs = [];

  for (let i = 0; i < rounds; i += 1) {
    const started = performance.now();

    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "sweet-pea-perf-audit/3.8" },
      });

      const headersAt = performance.now();
      const body = await response.arrayBuffer();
      const finished = performance.now();

      runs.push({
        ok: response.ok,
        status: response.status,
        ttfb: headersAt - started,
        total: finished - started,
        bytes: body.byteLength,
        cache:
          response.headers.get("x-vercel-cache") ||
          response.headers.get("cache-status") ||
          "-",
        cacheControl: response.headers.get("cache-control") || "-",
        serverTiming: response.headers.get("server-timing") || "-",
      });
    } catch (error) {
      runs.push({
        ok: false,
        status: 0,
        ttfb: 0,
        total: 0,
        bytes: 0,
        cache: "-",
        cacheControl: "-",
        serverTiming: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const valid = runs.filter((run) => run.status > 0);
  if (!valid.length) {
    return {
      route,
      status: "ERR",
      ttfb: "-",
      total: "-",
      kb: "-",
      cache: "-",
      note: runs[0]?.serverTiming || "request failed",
    };
  }

  const representative = valid[valid.length - 1];

  return {
    route,
    status: representative.status,
    ttfb: `${median(valid.map((run) => run.ttfb)).toFixed(0)} ms`,
    total: `${median(valid.map((run) => run.total)).toFixed(0)} ms`,
    kb: `${(median(valid.map((run) => run.bytes)) / 1024).toFixed(1)} KB`,
    cache: representative.cache,
    note:
      representative.serverTiming !== "-"
        ? representative.serverTiming
        : representative.cacheControl,
  };
}

console.log("");
console.log(`Sweet Pea performance audit: ${base}`);
console.log("Warming each route once, then measuring 3 requests...");

const results = [];
for (const route of routes) {
  results.push(await measure(route));
}

console.log("");
console.table(results);

console.log("");
console.log("Quick reading");
console.log("-------------");
console.log("- Cached public pages: aim for low and stable TTFB, ideally well below 300 ms for users near the edge.");
console.log("- /api/public/menu should expose CDN-friendly Cache-Control and normally become a cache HIT after warming.");
console.log("- A fast TTFB with a slow visual page usually points to image/video/client-JS weight rather than the backend.");
console.log("- Run this against the real Vercel production URL, not only localhost.");
console.log("");
