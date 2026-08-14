import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
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
  const [config, book, generator, templateGenerator, templateLayout, packageJson] = await Promise.all([
    readFile(new URL("../content/offbeat.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/LoreBook.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ShapeGenerator.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/TemplateGenerator.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/templateLayout.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(config, /maxUsers:\s*10/);
  assert.match(config, /ownerEditingOnly:\s*true/);
  assert.doesNotMatch(config, /status:\s*"placeholder"/);
  assert.match(config, /showcase:\s*{/);
  assert.match(config, /archive:\s*\[/);
  assert.match(config, /photography:\s*\[/);
  assert.match(config, /tasteAlignment:\s*{/);
  assert.match(config, /guidelineReferences:\s*{/);
  assert.match(config, /slug:\s*"howto"/);
  assert.match(config, /slug:\s*"taste-alignment"/);
  assert.match(config, /social:/);
  assert.match(config, /motion:/);
  assert.match(config, /offbeat-brand-guidelines\.pdf/);
  assert.match(config, /logo-alternate-lockup\.png/);
  assert.doesNotMatch(config, /Alternate logo · patch/);
  // Deck-derived pages are an internal reference archive: nothing in the
  // rendered content model or the UI may point at them.
  assert.doesNotMatch(config, /round-one/);
  assert.doesNotMatch(book, /round-one/);
  assert.doesNotMatch(book, /media\.social\[/);
  assert.doesNotMatch(config, /media\.inspiration/);
  assert.doesNotMatch(config, /42\s*%|28\s*%|18\s*%|12\s*%/);
  assert.doesNotMatch(book, /Don.t outline the logo/i);
  assert.match(config, /https:\/\/in\.pinterest\.com\/pin\/1082623198506999821\//);
  assert.match(config, /https:\/\/in\.pinterest\.com\/pin\/1082623198507000058\//);
  assert.match(book, /View all \{items\.length\} references/);
  assert.match(book, /What this demonstrates/);
  assert.match(book, /Preferred use/);
  assert.match(book, /DemoLogin/);
  assert.match(book, /<ShapeGenerator \/>/);
  assert.match(book, /logo-alternate-lockup\.png/);
  assert.doesNotMatch(book, /Alternate stepped slash logo/);
  assert.match(generator, /downloadSvg/);
  assert.match(generator, /downloadPng/);
  // The input handler must capture the value while the native event is live.
  // Reading currentTarget inside React's deferred updater caused the editor to
  // unmount during normal typing.
  assert.match(templateGenerator, /const value = event\.currentTarget\.value;/);
  assert.match(templateGenerator, /\[field\.key\]: value/);
  assert.doesNotMatch(templateGenerator, /\[field\.key\]: event\.currentTarget\.value/);
  assert.match(templateLayout, /const x = \(m\.width - w\) \/ 2;/);
  assert.match(templateLayout, /text\(x \+ w \/ 2, y \+ lineH \* 0\.45, line, head\.size, "#000000", \{/);
  assert.match(templateLayout, /anchor: "middle", font: DISPLAY_FONT/);
  assert.doesNotMatch(templateLayout, /text\(x \+ inset, y \+ lineH \* 0\.45, line, head\.size, c\.accentInk/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/offbeat/assets/logo-primary.svg", import.meta.url)),
    access(new URL("../public/offbeat/assets/logo-alternate-lockup.png", import.meta.url)),
    access(new URL("../public/offbeat/assets/shape-grid.svg", import.meta.url)),
    access(new URL("../public/offbeat/fonts/Archivo-Variable.ttf", import.meta.url)),
    // Preserved research archive — never rendered, never deleted.
    access(new URL("../public/offbeat/media/round-one/logo-construction.jpg", import.meta.url)),
    // Curated showcase sources.
    access(new URL("../public/offbeat/media/logo-exports/asset-38.png", import.meta.url)),
    access(new URL("../public/offbeat/media/motion/logo-slash-loop.mp4", import.meta.url)),
    access(new URL("../public/offbeat/media/social/partnership-announcement.jpg", import.meta.url)),
    access(new URL("../public/offbeat/media/guideline-references/business-guide.jpeg", import.meta.url)),
    access(new URL("../public/offbeat/media/guideline-references/environmental-pattern.jpeg", import.meta.url)),
    access(new URL("../public/offbeat/media/taste-alignment/is-offbeat/01-street-poster.jpg", import.meta.url)),
    access(new URL("../public/offbeat/media/taste-alignment/not-offbeat/13-soft-homepage.jpg", import.meta.url)),
    access(new URL("../public/og.png", import.meta.url)),
  ]);

  const [guidelineFiles, isOffbeatFiles, notOffbeatFiles] = await Promise.all([
    readdir(new URL("../public/offbeat/media/guideline-references/", import.meta.url)),
    readdir(new URL("../public/offbeat/media/taste-alignment/is-offbeat/", import.meta.url)),
    readdir(new URL("../public/offbeat/media/taste-alignment/not-offbeat/", import.meta.url)),
  ]);

  assert.equal(guidelineFiles.length, 13, "stores the duplicate business guide only once");
  assert.equal(isOffbeatFiles.length, 13);
  assert.equal(notOffbeatFiles.length, 13);
  for (const file of guidelineFiles) {
    assert.match(config, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
