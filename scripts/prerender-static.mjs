/**
 * Prerender the app shell to a static site for GitHub Pages.
 *
 * `vinext build` emits a Cloudflare Worker (dist/server) plus client assets
 * (dist/client) but no HTML file — the worker renders HTML per request.
 * GitHub Pages serves static files only, so we run the worker once at build
 * time and write its HTML to dist/client/index.html.
 *
 * This works because the brand book is a single client-rendered route: there
 * is no server data fetching, no API route, and every <Image> is `unoptimized`
 * so the /_vinext/image endpoint is never called.
 *
 * Pass a base path (e.g. "/lore-offbeat") to rewrite root-absolute asset URLs
 * for project-page deployments served from a subdirectory.
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CLIENT_DIR = new URL("../dist/client/", import.meta.url);
const basePath = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

/**
 * Rewrite the server build before rendering.
 *
 * dist/server/__vite_rsc_assets_manifest.js maps client references to
 * root-absolute chunk URLs. The browser resolves those at runtime, so if they
 * are not prefixed the page fetches /assets/* alongside the correct
 * /<base>/assets/* and logs 404s. This must run before the worker is imported.
 */
async function rewriteServerBundles() {
  if (!basePath) return 0;
  const serverDir = new URL("../dist/server/", import.meta.url);
  const files = await readdir(serverDir);
  let touched = 0;

  for (const file of files) {
    if (!/\.(js|json)$/.test(file)) continue;
    const path = new URL(file, serverDir);
    const source = await readFile(path, "utf8");
    const rewritten = applyBasePath(source);
    if (rewritten !== source) {
      await writeFile(path, rewritten);
      touched += 1;
    }
  }
  return touched;
}

async function renderHtml() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("prerender", String(Date.now()));
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  if (response.status !== 200) {
    throw new Error(`Prerender failed: worker returned ${response.status}`);
  }

  const html = await response.text();
  if (!html.includes("OFF/BEAT")) {
    throw new Error("Prerender failed: rendered HTML is missing expected content");
  }
  return html;
}

/**
 * Prefix root-absolute URLs so the site works from a subdirectory.
 *
 * Asset paths appear in HTML attributes, in CSS `url(...)`, and inside the
 * minified bundles — where the minifier rewrites string literals as template
 * literals, so the opening quote may be `"`, `'`, or a backtick. Match the
 * delimiter generically rather than assuming one quote style.
 */
// Vite's `base` already prefixes everything it emits (/assets/*). These are the
// public/ files referenced by hand-written paths in the content config, which
// Vite does not rewrite.
const ASSET_ROOTS = "offbeat|favicon\\.svg|og\\.png|robots\\.txt";
const QUOTED_ASSET = new RegExp(`(["'\`(])/(${ASSET_ROOTS})`, "g");

function applyBasePath(source) {
  if (!basePath) return source;
  return source.replace(QUOTED_ASSET, (_match, delimiter, root) => `${delimiter}${basePath}/${root}`);
}

async function rewriteBundles() {
  if (!basePath) return 0;
  const assetsDir = new URL("assets/", CLIENT_DIR);
  const files = await readdir(assetsDir);
  let touched = 0;

  for (const file of files) {
    if (!/\.(js|css)$/.test(file)) continue;
    const path = new URL(file, assetsDir);
    const source = await readFile(path, "utf8");
    const rewritten = applyBasePath(source);
    if (rewritten !== source) {
      await writeFile(path, rewritten);
      touched += 1;
    }
  }
  return touched;
}

const serverRewritten = await rewriteServerBundles();
const html = applyBasePath(await renderHtml());
await mkdir(CLIENT_DIR, { recursive: true });
await writeFile(new URL("index.html", CLIENT_DIR), html);

// Pages serves 404.html for unknown paths; reuse the shell so deep links work.
await writeFile(new URL("404.html", CLIENT_DIR), html);

// Without .nojekyll, Pages hides paths beginning with an underscore.
await writeFile(new URL(".nojekyll", CLIENT_DIR), "");

const rewritten = await rewriteBundles();
console.log(
  `Prerendered index.html + 404.html${
    basePath ? ` (base ${basePath}; ${serverRewritten} server + ${rewritten} client bundles rewritten)` : ""
  }`,
);
console.log(`Static site ready: ${join(new URL(CLIENT_DIR).pathname)}`);
