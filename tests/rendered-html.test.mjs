import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Lore OFF/BEAT shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /OFF\/BEAT Brand Guidelines/);
  assert.match(html, /LORE \/ OFF\/BEAT/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("keeps client content and downloadable files centralized", async () => {
  const [config, book, generator, packageJson] = await Promise.all([
    readFile(new URL("../content/offbeat.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/LoreBook.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ShapeGenerator.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(config, /maxUsers:\s*10/);
  assert.match(config, /ownerEditingOnly:\s*true/);
  assert.doesNotMatch(config, /status:\s*"placeholder"/);
  assert.match(config, /showcase:\s*{/);
  assert.match(config, /archive:\s*\[/);
  assert.match(config, /photography:\s*\[/);
  assert.match(config, /social:/);
  assert.match(config, /motion:/);
  assert.match(config, /offbeat-brand-guidelines\.pdf/);
  // Deck-derived pages are an internal reference archive: nothing in the
  // rendered content model or the UI may point at them.
  assert.doesNotMatch(config, /round-one/);
  assert.doesNotMatch(book, /round-one/);
  assert.doesNotMatch(book, /media\.social\[/);
  assert.match(book, /DemoLogin/);
  assert.match(book, /<ShapeGenerator \/>/);
  assert.match(generator, /downloadSvg/);
  assert.match(generator, /downloadPng/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/offbeat/assets/logo-primary.svg", import.meta.url)),
    access(new URL("../public/offbeat/assets/shape-grid.svg", import.meta.url)),
    access(new URL("../public/offbeat/fonts/Archivo-Variable.ttf", import.meta.url)),
    // Preserved research archive — never rendered, never deleted.
    access(new URL("../public/offbeat/media/round-one/logo-construction.jpg", import.meta.url)),
    // Curated showcase sources.
    access(new URL("../public/offbeat/media/logo-exports/asset-38.png", import.meta.url)),
    access(new URL("../public/offbeat/media/motion/logo-slash-loop.mp4", import.meta.url)),
    access(new URL("../public/offbeat/media/social/partnership-announcement.jpg", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
});
